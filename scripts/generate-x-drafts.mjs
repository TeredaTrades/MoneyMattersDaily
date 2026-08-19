#!/usr/bin/env node
// Generates copy-paste-ready X/Twitter draft text for blog posts.
//
// Usage:
//   node scripts/generate-x-drafts.mjs <slug-or-md-path> [<slug-or-md-path> ...]
//     (force-regenerates the draft for those specific posts, overwriting any
//     manual edits already made to them)
//   node scripts/generate-x-drafts.mjs --all
//     (adds a draft for any non-draft post that doesn't have one yet —
//     existing drafts are left untouched, so hand-edited text survives)
//
// Output: content-pipeline/x-drafts.md
//
// This does NOT post anything to X and does not call the X API — X's API
// stopped having a free tier in Feb 2026, and posting automation is
// deliberately on hold (see NOTES.md) until Pinterest automation is built
// and there's a proven posting cadence. This script only drafts the text;
// a human copies it into the X app by hand.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const OUT_FILE = path.join(ROOT, 'content-pipeline/x-drafts.md');

const SITE = 'https://moneymattersdaily.money';
const X_LIMIT = 280;

function loadPost(slugOrPath) {
  const slug = slugOrPath.includes('/')
    ? path.basename(slugOrPath, '.md')
    : slugOrPath.replace(/\.md$/, '');
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    console.error(`Skipping ${slugOrPath} — no matching file at ${filePath}`);
    return null;
  }
  const { data } = matter(fs.readFileSync(filePath, 'utf-8'));
  return { slug, data };
}

function allPosts() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => loadPost(f))
    .filter((p) => p && !p.data.draft)
    .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
}

function buildDraftText(title, description) {
  // No URL_RESERVE needed anymore — the link goes in a separate reply, not
  // the main post. X's algorithm (as of ~Q1 2026) suppresses reach 30-50%+
  // for non-Premium accounts when a link is in the main post body, so the
  // main post is link-free and the URL is posted as the first reply instead.
  const maxText = X_LIMIT - 1;
  let text = `${title} — ${description}`;
  if (text.length > maxText) {
    text = `${text.slice(0, maxText - 1).trimEnd()}…`;
  }
  return text;
}

function parseExistingDrafts(fileText) {
  const map = new Map();
  if (!fileText) return map;
  const sections = fileText.split(/\n(?=## )/g);
  for (const section of sections) {
    const match = section.match(/^## (\S+)\n([\s\S]*)$/);
    if (match) map.set(match[1], match[2].trim());
  }
  return map;
}

function renderSection(slug, url, body) {
  return `## ${slug}\n\n${body}\n\n<!-- link: ${url} -->\n`;
}

function main() {
  const args = process.argv.slice(2);
  const forceAll = args.includes('--all');
  const explicitTargets = args.filter((a) => a !== '--all');

  const existingText = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, 'utf-8') : '';
  const existingDrafts = parseExistingDrafts(existingText);

  const posts = allPosts();
  const forceSlugs = new Set(
    explicitTargets.map((t) => (t.includes('/') ? path.basename(t, '.md') : t.replace(/\.md$/, '')))
  );

  let written = 0;
  let skipped = 0;

  for (const { slug, data } of posts) {
    const url = `${SITE}/blog/${slug}`;
    const shouldForce = forceSlugs.has(slug);
    const hasExisting = existingDrafts.has(slug);

    if (hasExisting && !shouldForce) {
      skipped += 1;
      continue; // leave hand-edited draft alone
    }
    if (!hasExisting && !forceAll && !shouldForce) {
      continue; // not asked for and no existing draft — don't touch
    }

    const body =
      `**Post (attach the matching pin image from public/pins/):**\n` +
      `\`\`\`\n${buildDraftText(data.title, data.description)}\n\`\`\`\n\n` +
      `**First reply (post right after, replying to your own post — no image needed):**\n` +
      `\`\`\`\n${url}\n\`\`\``;
    existingDrafts.set(slug, body);
    written += 1;
  }

  if (written === 0) {
    console.log('Nothing to generate — no new posts and no explicit targets.');
    return;
  }

  const orderedSlugs = posts.map((p) => p.slug).filter((s) => existingDrafts.has(s));
  const header =
    '# X draft posts\n\n' +
    'Auto-generated starting drafts — edit freely before posting, this file is\n' +
    'never auto-posted anywhere. Re-running `npm run x:drafts` only adds drafts\n' +
    'for new posts; it never overwrites an existing one unless you pass that\n' +
    "post's slug explicitly.\n\n" +
    'Each entry is split into a main post and a separate first-reply. X\'s\n' +
    'algorithm significantly suppresses reach for non-Premium accounts when a\n' +
    'link is in the main post body, so post the text first (with the matching\n' +
    'pin image from public/pins/ attached), then reply to your own post with\n' +
    'just the link. The pin images already have the site domain printed on\n' +
    'them, so the image itself carries attribution even before the reply.\n';

  const body = orderedSlugs
    .map((slug) => `## ${slug}\n\n${existingDrafts.get(slug)}\n`)
    .join('\n');

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${header}\n${body}`);
  console.log(`wrote ${written} draft(s) to ${path.relative(ROOT, OUT_FILE)} (${skipped} left untouched)`);
}

main();
