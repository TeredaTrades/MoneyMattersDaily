#!/usr/bin/env node
// Lists which published posts still need the "depth treatment" second pass
// (worked numeric example, common-mistakes section, who-this-is-for section,
// sourced links for anything time-sensitive) — see the depthReviewed field
// in src/content.config.ts for the two-tier publishing model this supports.
//
// Usage:
//   npm run content:depth-status

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return fm;
}

const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith('.md'));

const pending = [];
const done = [];

for (const file of files) {
  const raw = await readFile(path.join(BLOG_DIR, file), 'utf-8');
  const fm = parseFrontmatter(raw);
  if (fm.draft === 'true') continue; // skip drafts
  const slug = file.replace(/\.md$/, '');
  const reviewed = fm.depthReviewed === 'true';
  (reviewed ? done : pending).push({ slug, pillar: fm.pillar });
}

console.log(`\nDepth-treatment status: ${done.length} done, ${pending.length} pending\n`);

if (pending.length) {
  console.log('Pending second pass:');
  for (const p of pending) console.log(`  - ${p.slug}  (${p.pillar})`);
} else {
  console.log('Nothing pending — full catalog is depth-reviewed.');
}
console.log('');
