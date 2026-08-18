#!/usr/bin/env node
// Generates dist/sitemap.xml by walking the ACTUAL built pages in dist/,
// so it can never drift out of sync with real routes the way a hand-written
// sitemap can. Runs automatically after every build via the npm
// "postbuild" hook — nothing to remember to update when a page is added.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const OUT_FILE = path.join(DIST_DIR, 'sitemap.xml');

const SITE = 'https://moneymattersdaily.money';

// Pages that exist as built HTML but shouldn't be in the sitemap
// (add slugs/paths here as needed — e.g. a future thank-you or 404 page).
const EXCLUDE = new Set(['404']);

function findPages(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const urls = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      urls.push(...findPages(fullPath, path.join(base, entry.name)));
    } else if (entry.name === 'index.html') {
      const routePath = base.split(path.sep).filter(Boolean).join('/');
      if (EXCLUDE.has(routePath)) continue;
      urls.push(routePath === '' ? '/' : `/${routePath}/`);
    }
  }

  return urls;
}

if (!fs.existsSync(DIST_DIR)) {
  console.error('dist/ not found — run this after `astro build`, not before.');
  process.exit(1);
}

const urls = findPages(DIST_DIR).sort();
const today = new Date().toISOString().slice(0, 10);

const body = urls
  .map(
    (url) => `  <url>
    <loc>${SITE}${url}</loc>
    <lastmod>${today}</lastmod>
  </url>`
  )
  .join('\n\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${body}

</urlset>
`;

fs.writeFileSync(OUT_FILE, xml);
console.log(`wrote ${path.relative(ROOT, OUT_FILE)} with ${urls.length} page(s)`);
