// Builds the Cloudflare static website without publishing unrelated repository files.
// Source data remains in GitHub; this copies only the browser assets that Menu Studio needs.
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const root = process.cwd();
const output = join(root, 'dist', 'menustudio');
const allowed = [
  'index.html',
  'security.css',
  'security-app.js',
  'github-sync-config.js',
  'database/allergens.json',
  'database/venues.json',
  'assets/company-logo.png',
  'themes/gallery.json',
];
for (const relative of allowed) {
  const src = join(root, relative);
  const dst = join(output, relative);
  await stat(src); // Fail rather than silently deploy an incomplete site.
  await mkdir(dirname(dst), { recursive: true });
  await copyFile(src, dst);
  console.log('Included:', relative);
}
console.log('Menu Studio static site prepared:', output);
