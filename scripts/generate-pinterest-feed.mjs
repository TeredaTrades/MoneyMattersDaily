#!/usr/bin/env node
// Builds one curated RSS feed PER PILLAR — public/pinterest-feed-<pillar>.xml —
// each containing only posts in that pillar where pinApproved: true.
//
// Why per-pillar: Pinterest's RSS auto-publish connects one feed to one
// board. A single combined feed would dump every approved post into
// whichever board that feed is connected to, ignoring the pillar-specific
// boards already set up on the account. Connect each feed URL below to its
// matching board under Pinterest Settings -> Bulk Create Pins.
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
const OUT_DIR = path.join(ROOT, 'public');

const SITE = 'https://moneymattersdaily.money';

// Maps each content pillar to the Pinterest board it should feed.
// Update this if boards get renamed/added on the Pinterest side.
const PILLAR_BOARDS = {
  budgeting: 'Budgeting Tips',
  saving: 'Saving Money',
  credit: 'Building Credit',
  'investing-basics': 'Investing Basics', // no board created on Pinterest yet as of this writing
  'app-comparisons': 'Budgeting App Reviews',
  'travel-finance': 'Travel & Nomad Finances', // no board created on Pinterest yet as of this writing
  'news-trends': 'News & Trends', // no board created on Pinterest yet as of this writing
};

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const allPosts = fs
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
  });

function buildFeedXml(pillar, posts) {
  const boardName = PILLAR_BOARDS[pillar] ?? pillar;
  const items = posts
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Money Matters Daily — Pinterest Feed (${escapeXml(boardName)})</title>
  <link>${SITE}</link>
  <description>Curated, approved pins for the "${escapeXml(
    boardName
  )}" board. Not the main site feed.</description>
${items}
</channel>
</rss>
`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const pillars = Object.keys(PILLAR_BOARDS);
let totalWritten = 0;

for (const pillar of pillars) {
  const posts = allPosts.filter((p) => p.pillar === pillar);
  const xml = buildFeedXml(pillar, posts);
  const outFile = path.join(OUT_DIR, `pinterest-feed-${pillar}.xml`);
  fs.writeFileSync(outFile, xml);
  console.log(
    `wrote ${path.relative(ROOT, outFile)} with ${posts.length} approved post(s) -> board "${
      PILLAR_BOARDS[pillar]
    }"`
  );
  totalWritten += posts.length;
}

const unmapped = allPosts.filter((p) => !pillars.includes(p.pillar));
if (unmapped.length > 0) {
  console.warn(
    `warning: ${unmapped.length} approved post(s) have a pillar with no board mapping in PILLAR_BOARDS and were skipped: ` +
      unmapped.map((p) => `${p.slug} (${p.pillar})`).join(', ')
  );
}

console.log(`total: ${totalWritten} approved post(s) across ${pillars.length} pillar feeds`);
