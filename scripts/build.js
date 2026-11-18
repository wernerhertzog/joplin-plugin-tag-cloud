'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const publish = path.join(root, 'publish');
fs.mkdirSync(dist, { recursive: true });
fs.mkdirSync(publish, { recursive: true });
// Joplin executes the entry point from a temporary file, so bundle our local module.
const data = fs.readFileSync(path.join(root, 'src/cloud-data.js'), 'utf8').replace("module.exports = { getAll, loadCloudFromApi, loadCloudFromDatabase, loadCloud };", '');
const main = fs.readFileSync(path.join(root, 'src/index.js'), 'utf8').replace("const { loadCloud } = require('./cloud-data');", '');
fs.writeFileSync(path.join(dist, 'index.js'), `${data}\n${main}`);
for (const file of ['cloud.css', 'webview.js', 'manifest.json']) {
  fs.copyFileSync(path.join(root, 'src', file), path.join(dist, file));
}
const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (manifest.version !== pkg.version) throw new Error('Plugin and package versions must match');
const archive = path.join(publish, 'tag-cloud.jpl');
fs.rmSync(archive, { force: true });
execFileSync('tar', ['-cf', archive, 'index.js', 'cloud.css', 'webview.js', 'manifest.json'], { cwd: dist, env: { ...process.env, COPYFILE_DISABLE: '1' } });
const digest = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
let commit = '';
try {
  const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
  commit = `${branch === 'HEAD' ? 'master' : branch}:${sha}`;
} catch { /* A local build can be made before Git is initialized. */ }
const metadata = { ...manifest, _publish_hash: `sha256:${digest}`, _publish_commit: commit };
fs.writeFileSync(path.join(publish, 'tag-cloud.json'), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Built ${archive} and release metadata`);
