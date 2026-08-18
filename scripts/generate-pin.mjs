#!/usr/bin/env node
// Generates a branded 1000x1500 Pinterest pin PNG for one or more blog posts.
//
// Usage:
//   node scripts/generate-pin.mjs <slug-or-md-path> [<slug-or-md-path> ...]
//   node scripts/generate-pin.mjs --all        (regenerate every non-draft post)
//
// Output: public/pins/<slug>.png
//
// This is a template renderer, not a design tool — it exists to give reviewers
// something concrete to look at in a PR, not to be the final word on layout.
// Anyone can hand-edit an individual PNG in public/pins/ after generation and
// it will be left alone on future runs unless that post's file is regenerated again.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const OUT_DIR = path.join(ROOT, 'public/pins');

const PALETTE = {
  bg: '#1c4a4a',
  bgLight: '#245c5c',
  gold: '#c9a875',
  offwhite: '#e8edf2',
  midTeal: '#5b8a8a',
  lightTeal: '#a8c9c9',
};

const PILLAR_LABELS = {
  budgeting: 'BUDGETING',
  saving: 'SAVING',
  credit: 'CREDIT',
  'investing-basics': 'INVESTING BASICS',
  'app-comparisons': 'APP COMPARISONS',
  'travel-finance': 'TRAVEL & NOMAD FINANCES',
  'news-trends': 'NEWS & TRENDS',
};

const PILLAR_ACCENTS = {
  budgeting: PALETTE.gold,
  saving: PALETTE.lightTeal,
  credit: PALETTE.midTeal,
  'investing-basics': PALETTE.gold,
  'app-comparisons': PALETTE.lightTeal,
  'travel-finance': PALETTE.gold,
  'news-trends': PALETTE.midTeal,
};

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Rough word-wrap by estimated character width. Good enough for a review
// draft — a human approves (and can tweak) before anything goes live.
function wrapText(text, maxCharsPerLine) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildSvg({ title, pillar }) {
  const W = 1000;
  const H = 1500;
  const accent = PILLAR_ACCENTS[pillar] ?? PALETTE.gold;
  const pillarLabel = PILLAR_LABELS[pillar] ?? pillar.toUpperCase();

  const titleLines = wrapText(title, 18).slice(0, 5); // cap so it can't overflow
  const titleFontSize = titleLines.length > 3 ? 62 : 74;
  const lineHeight = titleFontSize * 1.18;
  const titleBlockHeight = titleLines.length * lineHeight;
  const titleStartY = 620 - titleBlockHeight / 2 + titleFontSize;

  const titleTspans = titleLines
    .map(
      (line, i) =>
        `<tspan x="${W / 2}" y="${titleStartY + i * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${PALETTE.bgLight}" />
      <stop offset="100%" stop-color="${PALETTE.bg}" />
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bgGrad)" />

  <!-- wordmark -->
  <text x="${W / 2}" y="140" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="34" font-weight="700" fill="${PALETTE.offwhite}" letter-spacing="2">MONEY MATTERS DAILY</text>

  <!-- pillar badge -->
  <text x="${W / 2}" y="200" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="24" font-weight="700" fill="${accent}" letter-spacing="4">${escapeXml(pillarLabel)}</text>

  <!-- divider -->
  <rect x="${W / 2 - 60}" y="230" width="120" height="4" rx="2" fill="${accent}" />

  <!-- title -->
  <text text-anchor="middle" font-family="Arial, sans-serif" font-weight="800"
        font-size="${titleFontSize}" fill="${PALETTE.offwhite}">
      ${titleTspans}
  </text>

  <!-- CTA -->
  <text x="${W / 2}" y="${H - 140}" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="26" fill="${PALETTE.offwhite}" opacity="0.85">Full breakdown at</text>
  <text x="${W / 2}" y="${H - 95}" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="34" font-weight="700" fill="${accent}">moneymattersdaily.money</text>
</svg>`;
}

function resolvePostFile(arg) {
  if (fs.existsSync(arg)) return path.resolve(arg);
  const bySlug = path.join(BLOG_DIR, `${arg}.md`);
  if (fs.existsSync(bySlug)) return bySlug;
  throw new Error(`Could not resolve post: ${arg}`);
}

function allPostFiles() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(BLOG_DIR, f));
}

function generateOne(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(raw);
  if (data.draft) {
    console.log(`skip (draft): ${path.basename(filePath)}`);
    return null;
  }
  const slug = path.basename(filePath, '.md');
  const svg = buildSvg({ title: data.title, pillar: data.pillar });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1000 } });
  const png = resvg.render().asPng();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${slug}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`wrote ${path.relative(ROOT, outPath)}`);
  return outPath;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/generate-pin.mjs <slug-or-path> [...] | --all');
  process.exit(1);
}

const files = args[0] === '--all' ? allPostFiles() : args.map(resolvePostFile);
for (const f of files) generateOne(f);
