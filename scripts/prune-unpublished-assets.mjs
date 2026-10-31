#!/usr/bin/env node
// Scheduled publishing helper. Pins and heroes live in public/ and are copied
// into dist/ whether or not the post they belong to is live yet, so a
// future-dated post's images would otherwise be reachable by URL before its
// date. This removes dist/pins/<slug>.png and dist/heroes/<slug>.png for every
// post that is not live yet. Runs after the build (npm "postbuild").
// The rule itself lives in src/lib/published.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { isLive } from '../src/lib/published.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const DIST = path.join(ROOT, 'dist');

let pruned = 0;
let scheduled = [];
for (const f of fs.readdirSync(BLOG_DIR).filter((n) => n.endsWith('.md'))) {
  const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8'));
  if (data.draft || isLive(data)) continue;
  const slug = path.basename(f, '.md');
  scheduled.push(`${new Date(data.pubDate).toISOString().slice(0, 10)} ${slug}`);
  for (const dir of ['pins', 'heroes']) {
    const p = path.join(DIST, dir, `${slug}.png`);
    if (fs.existsSync(p)) {
      fs.rmSync(p);
      pruned++;
    }
  }
}
scheduled.sort();
console.log(`scheduled posts not yet live: ${scheduled.length}; pruned ${pruned} image(s) from dist/`);
for (const s of scheduled) console.log(`  ${s}`);
