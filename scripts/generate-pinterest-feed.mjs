#!/usr/bin/env node
// Builds public/pinterest-feed.xml — a curated RSS feed containing ONLY posts
// where pinApproved: true in frontmatter. This is the feed URL you paste into
// Pinterest (Settings -> Bulk Create Pins -> Auto-publish), NOT the main site
// feed — that keeps unreviewed posts out of Pinterest entirely.
//
// Run automatically as part of `npm run build` (see package.json "prebuild").

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const PINS_DIR = path.join(ROOT, 'public/pins');
const OUT_FILE = path.join(ROOT, 'public/pinterest-feed.xml');

const SITE = 'https://moneymattersdaily.money';

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const posts = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8');
    const { data } = matter(raw);
    return { slug: path.basename(f, '.md'), ...data };
  })
  .filter((p) => !p.draft && p.pinApproved)
  .filter((p) => {
    const pinExists = fs.existsSync(path.join(PINS_DIR, `${p.slug}.png`));
    if (!pinExists) {
      console.warn(
        `warning: "${p.slug}" is pinApproved but has no public/pins/${p.slug}.png — skipping from feed`
      );
    }
    return pinExists;
  })
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

const items = posts
  .map((p) => {
    const url = `${SITE}/blog/${p.slug}/`;
    const imageUrl = `${SITE}/pins/${p.slug}.png`;
    const pubDate = new Date(p.pubDate).toUTCString();
    return `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="false">${SITE}/pinterest/${p.slug}</guid>
    <description>${escapeXml(p.description)}</description>
    <pubDate>${pubDate}</pubDate>
    <enclosure url="${imageUrl}" type="image/png" />
  </item>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Money Matters Daily — Pinterest Feed</title>
  <link>${SITE}</link>
  <description>Curated, approved pins for Pinterest auto-publish. Not the main site feed.</description>
${items}
</channel>
</rss>
`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, xml);
console.log(`wrote ${path.relative(ROOT, OUT_FILE)} with ${posts.length} approved post(s)`);
