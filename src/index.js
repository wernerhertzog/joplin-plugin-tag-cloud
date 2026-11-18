'use strict';

// Joplin injects its plugin API as the global `joplin`.
const { loadCloud } = require('./cloud-data');

joplin.plugins.register({
  onStart: async function() {
    const panel = await joplin.views.panels.create('tagCloud.panel');
    let cloud = null;
    let loadedAt = 0;
    let pending = null;
    let rerun = false;

    function send(message) {
      joplin.views.panels.postMessage(panel, message);
    }

    async function refresh() {
      if (pending) {
        rerun = true;
        return pending;
      }
      pending = (async () => {
        do {
          rerun = false;
          send({ type: 'loading', hasData: cloud !== null });
          try {
            cloud = await loadCloud(joplin, (done, total) => {
              if (done === 0 || done === total || done % 25 === 0) send({ type: 'progress', done, total });
            });
            loadedAt = Date.now();
            send({ type: 'cloud', tags: cloud });
          } catch (error) {
            console.error('Tag Cloud: could not load tags', error);
            send({ type: 'error', hasData: cloud !== null });
          }
        } while (rerun);
      })();
      try { await pending; } finally { pending = null; }
    }

    await joplin.views.panels.setHtml(panel, `
      <main class="tag-cloud-app">
        <header class="header"><h1>Tag cloud</h1><button id="refresh" class="refresh" type="button" title="Refresh tag cloud" aria-label="Refresh tag cloud">&#8635;</button></header>
        <p class="intro">Larger tags are used on more notes.</p>
        <div id="status" class="status" role="status" aria-live="polite">Loading tags…</div>
        <div id="cloud" class="cloud" role="region" tabindex="0" aria-label="Tags"></div>
      </main>`);
    await joplin.views.panels.onMessage(panel, async message => {
      if (!message || typeof message !== 'object') return;
      if (message.type === 'ready') {
        if (cloud !== null) send({ type: 'cloud', tags: cloud });
        else if (pending) send({ type: 'loading', hasData: false });
        else void refresh();
      } else if (message.type === 'refresh') {
        await refresh();
      } else if (message.type === 'openTag' && typeof message.id === 'string' && cloud && cloud.some(tag => tag.id === message.id)) {
        await joplin.commands.execute('openTag', message.id);
      }
    });
    await joplin.views.panels.addScript(panel, './cloud.css');
    await joplin.views.panels.addScript(panel, './webview.js');

    await joplin.commands.register({
      name: 'toggleTagCloud', label: 'Toggle Tag Cloud',
      execute: async () => {
        const visible = await joplin.views.panels.visible(panel);
        await joplin.views.panels.show(panel, !visible);
        if (!visible && Date.now() - loadedAt > 30000) void refresh();
      },
    });
    await joplin.views.menuItems.create('toggleTagCloudMenu', 'toggleTagCloud', 'view');
    await joplin.workspace.onSyncComplete(() => { void refresh(); });
    await joplin.workspace.onNoteSelectionChange(async () => {
      if (cloud !== null && Date.now() - loadedAt > 30000 && await joplin.views.panels.visible(panel)) void refresh();
    });
  },
});
