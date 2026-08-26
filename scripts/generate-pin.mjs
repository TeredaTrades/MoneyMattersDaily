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
//
// Each pillar gets its own hand-drawn line-icon (original shapes, not sourced
// from any icon set), and each post gets a seeded pseudo-random "personality"
// (icon rotation/offset, scatter-dot layout) derived from its slug, so posts
// sharing a pillar don't render as identical pins.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { Resvg } from '@resvg/resvg-js';
import {
  PALETTE,
  PILLAR_LABELS,
  PILLAR_ACCENTS,
  makeRng,
  iconFor,
  buildFlowVisual,
  buildTableVisual,
  escapeXml,
  wrapText,
  scatterDots,
  keyMark,
} from './lib/visual-kit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const OUT_DIR = path.join(ROOT, 'public/pins');

// Palette, pillar labels/accents, pillar icon illustrations, and the small
// SVG-building helpers (RNG, word-wrap, scatter dots, brand key mark) all
// now live in ./lib/visual-kit.mjs, shared with scripts/generate-hero.mjs
// so the in-post hero banners stay visually consistent with these pins.

function buildSvg({ title, pillar, slug, equation, pinVisual = 'icon', flowSteps, tableRows, pinIcon }) {
  const W = 1000;
  const H = 1500;
  const accent = PILLAR_ACCENTS[pillar] ?? PALETTE.gold;
  const pillarLabel = PILLAR_LABELS[pillar] ?? pillar.toUpperCase();
  const rng = makeRng(slug);

  const titleLines = wrapText(title, 18).slice(0, 5); // cap so it can't overflow
  const titleFontSize = titleLines.length > 3 ? 58 : 68;
  const lineHeight = titleFontSize * 1.18;
  const titleBlockHeight = titleLines.length * lineHeight;
  const titleCenterY = 840;
  const titleStartY = titleCenterY - titleBlockHeight / 2 + titleFontSize;

  const titleTspans = titleLines
    .map(
      (line, i) =>
        `<tspan x="${W / 2}" y="${titleStartY + i * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join('\n      ');

  // Per-post variation: icon rotation, horizontal drift, and scale all come
  // from the slug seed, so two posts in the same pillar (same icon, same
  // color) still land differently on the page. Only used when pinVisual
  // is the default 'icon' — the other visual modes have their own layout.
  const iconRotation = rng.range(-7, 7);
  const iconOffsetX = rng.range(-40, 40);
  const iconScale = rng.range(0.92, 1.12);
  const iconCenterX = W / 2 + iconOffsetX;
  const iconCenterY = 470;

  const topDots = scatterDots(rng, accent, PALETTE.lightTeal, [255, 320]);
  const bottomDots = scatterDots(rng, accent, PALETTE.lightTeal, [1140, 1290]);

  // The icon-area visual: pillar icon (default), a big equation display, a
  // flow chain, a small table, or nothing (plain — title-forward pin).
  let visualMarkup = '';
  if (pinVisual === 'icon') {
    visualMarkup = `
  <g transform="translate(${iconCenterX.toFixed(1)} ${iconCenterY}) rotate(${iconRotation.toFixed(1)}) scale(${iconScale.toFixed(2)})">
    ${iconFor(pillar, pinIcon)(accent, PALETTE.offwhite)}
  </g>`;
  } else if (pinVisual === 'equation') {
    const text = equation || '';
    visualMarkup = `
  <rect x="${W / 2 - 320}" y="${iconCenterY - 90}" width="640" height="180" rx="16" fill="${PALETTE.offwhite}" opacity="0.08" />
  <rect x="${W / 2 - 320}" y="${iconCenterY - 90}" width="640" height="180" rx="16" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.75" />
  <text x="${W / 2}" y="${iconCenterY + 18}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="48" font-weight="700" fill="${PALETTE.offwhite}">${escapeXml(text)}</text>`;
  } else if (pinVisual === 'flow') {
    visualMarkup = buildFlowVisual(flowSteps, accent, PALETTE.offwhite, iconCenterY);
  } else if (pinVisual === 'table') {
    visualMarkup = buildTableVisual(tableRows, accent, PALETTE.offwhite, iconCenterY);
  }
  // 'plain' leaves visualMarkup empty — no icon, no equation, no table.

  // The standalone equation box (between icon and title) only applies in
  // icon/flow/table/plain modes — 'equation' mode already rendered the
  // equation itself, larger, in the visual area above.
  const equationBoxMarkup =
    equation && pinVisual !== 'equation'
      ? `
  <rect x="${W / 2 - 230}" y="600" width="460" height="66" rx="10" fill="${PALETTE.offwhite}" opacity="0.08" />
  <rect x="${W / 2 - 230}" y="600" width="460" height="66" rx="10" fill="none" stroke="${accent}" stroke-width="2" opacity="0.6" />
  <text x="${W / 2}" y="643" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="34" font-weight="700" fill="${PALETTE.offwhite}">${escapeXml(equation)}</text>`
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${PALETTE.bgLight}" />
      <stop offset="100%" stop-color="${PALETTE.bg}" />
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bgGrad)" />

  <!-- brand mark, sits in the empty space above the wordmark -->
  ${keyMark(W / 2, 95, 46, PALETTE.offwhite)}

  <!-- wordmark -->
  <text x="${W / 2}" y="140" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="34" font-weight="700" fill="${PALETTE.offwhite}" letter-spacing="2">MONEY MATTERS DAILY</text>

  <!-- pillar badge -->
  <text x="${W / 2}" y="200" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="24" font-weight="700" fill="${accent}" letter-spacing="4">${escapeXml(pillarLabel)}</text>

  <!-- divider -->
  <rect x="${W / 2 - 60}" y="230" width="120" height="4" rx="2" fill="${accent}" />

  <!-- scatter accents -->
  ${topDots}

  <!-- icon-area visual: pillar icon, equation, flow, table, or nothing (plain) -->
  ${visualMarkup}

  ${equationBoxMarkup}

  <!-- title -->
  <text text-anchor="middle" font-family="Arial, sans-serif" font-weight="800"
        font-size="${titleFontSize}" fill="${PALETTE.offwhite}">
      ${titleTspans}
  </text>

  <!-- scatter accents -->
  ${bottomDots}

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
  const svg = buildSvg({
    title: data.title,
    pillar: data.pillar,
    slug,
    equation: data.equation,
    pinVisual: data.pinVisual,
    flowSteps: data.flowSteps,
    tableRows: data.tableRows,
    pinIcon: data.pinIcon,
  });
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
