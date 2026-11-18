'use strict';

function sortCloud(tags) {
  return tags.filter(tag => tag.count > 0).sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base', numeric: true }) || a.id.localeCompare(b.id)
  );
}

// This is the same read-only view that supplies the desktop sidebar's counts.
// A single query avoids an API request for every tag and every page of notes.
async function loadCloudFromDatabase(api) {
  const profileDir = await api.settings.globalValue('profileDir');
  if (typeof profileDir !== 'string' || !profileDir) throw new Error('Joplin profile directory is unavailable');
  const sqlite = api.require('sqlite3');
  const db = await new Promise((resolve, reject) => {
    const connection = new sqlite.Database(`${profileDir}/database.sqlite`, sqlite.OPEN_READONLY, error => {
      if (error) reject(error); else resolve(connection);
    });
  });
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT id, title, note_count AS count FROM tags_with_note_count', (error, result) => {
        if (error) reject(error); else resolve(result);
      });
    });
    return sortCloud(rows);
  } finally {
    await new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
  }
}

async function getAll(data, path, fields) {
  let page = 1;
  let hasMore;
  const items = [];
  do {
    const result = await data.get(path, { fields, limit: 100, page });
    items.push(...result.items);
    hasMore = result.has_more;
    page += 1;
  } while (hasMore);
  return items;
}

async function loadCloudFromApi(data, onProgress = () => {}) {
  const tags = await getAll(data, ['tags'], ['id', 'title']);
  const result = new Array(tags.length);
  let next = 0;
  let completed = 0;
  onProgress(completed, tags.length);
  async function worker() {
    while (next < tags.length) {
      const index = next++;
      const tag = tags[index];
      const notes = await getAll(data, ['tags', tag.id, 'notes'], ['id']);
      result[index] = { id: tag.id, title: tag.title, count: notes.length };
      onProgress(++completed, tags.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, tags.length) }, worker));
  return sortCloud(result);
}

async function loadCloud(api, onProgress = () => {}) {
  try {
    return await loadCloudFromDatabase(api);
  } catch (error) {
    console.warn('Tag Cloud: fast count unavailable; using Joplin data API', error);
    return loadCloudFromApi(api.data, onProgress);
  }
}

module.exports = { getAll, loadCloudFromApi, loadCloudFromDatabase, loadCloud };
