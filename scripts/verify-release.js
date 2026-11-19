'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src', 'manifest.json'), 'utf8'));
const archive = path.join(root, 'publish', 'tag-cloud.jpl');
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'publish', 'tag-cloud.json'), 'utf8'));

assert.match(pkg.name, /^joplin-plugin-/);
assert.ok(pkg.keywords.includes('joplin-plugin'));
assert.notEqual(pkg.private, true, 'package.json marks the package private');
assert.equal(pkg.version, manifest.version, 'package and plugin versions must agree');
assert.ok(pkg.files.includes('publish'), 'package must include publish/');
assert.equal(metadata.id, manifest.id);
assert.equal(metadata.version, manifest.version);
const hash = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
assert.equal(metadata._publish_hash, `sha256:${hash}`, 'archive hash must match metadata');
const entries = execFileSync('tar', ['-tf', archive], { encoding: 'utf8' }).trim().split('\n');
for (const file of ['index.js', 'manifest.json', 'webview.js', 'cloud.css']) {
  assert.ok(entries.includes(file), `archive is missing ${file}`);
}
const bundledManifest = JSON.parse(execFileSync('tar', ['-xOf', archive, 'manifest.json'], { encoding: 'utf8' }));
assert.deepEqual(bundledManifest, manifest, 'archive manifest must match source');
console.log(`Release checks passed for ${manifest.id} ${manifest.version}`);
