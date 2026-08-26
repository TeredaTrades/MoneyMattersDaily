#!/usr/bin/env node
// Generates a landscape in-post "hero" banner PNG for one or more blog posts,
// solving the site's text-only-post gap without reaching for stock photos
// (licensing risk + doesn't match the site's plain/credible, no-lead-gen
// feel). Reuses the exact same palette, pillar icon illustrations, and
// per-slug seeded "personality" as the Pinterest pins (scripts/generate-pin.mjs)
// via scripts/lib/visual-kit.mjs, so the two visual systems read as one brand
// instead of two different templates bolted together.
//
// Usage:
//   node scripts/generate-hero.mjs <slug-or-path> [<slug-or-path> ...]
//   node scripts/generate-hero.mjs --all        (regenerate every non-draft post)
//
// Output: public/heroes/<slug>.png (1600x500 — wide enough to read clearly
// at the ~672px content column width in BaseLayout.astro, sharp on retina).
//
// Like generate-pin.mjs, this is a template renderer for a fast, consistent
// default — not the final word. Hand-edit an individual PNG in public/heroes/
// afterward and it's left alone unless that post's file is regenerated again.

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
  scatterDots,
  keyMark,
  escapeXml,
} from './lib/visual-kit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const OUT_DIR = path.join(ROOT, 'public/heroes');

function buildSvg({ pillar, slug, pinIcon }) {
  const W = 1600;
  const H = 500;
  const accent = PILLAR_ACCENTS[pillar] ?? PALETTE.gold;
  const pillarLabel = PILLAR_LABELS[pillar] ?? pillar.toUpperCase();
  const rng = makeRng(`hero-${slug}`); // distinct seed namespace from the pin's rng

  // Icon sits left-of-center, mirroring how a hero image typically has a
  // focal illustration with breathing room around it rather than being
  // dead-centered like the pin (which is a tall, title-forward format).
  const iconCenterX = W * 0.24;
  const iconCenterY = H / 2;
  const iconRotation = rng.range(-6, 6);
  const iconScale = rng.range(1.55, 1.85); // bigger than the pin's icon — it's the whole visual here

  const dots = scatterDots(rng, accent, PALETTE.offwhite, [40, H - 40]);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PALETTE.bgLight}" />
      <stop offset="100%" stop-color="${PALETTE.bg}" />
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bgGrad)" />

  <!-- scatter accents, spread across the full width -->
  ${dots}

  <!-- focal pillar icon -->
  <g transform="translate(${iconCenterX.toFixed(1)} ${iconCenterY}) rotate(${iconRotation.toFixed(1)}) scale(${iconScale.toFixed(2)})">
    ${iconFor(pillar, pinIcon)(accent, PALETTE.offwhite)}
  </g>

  <!-- divider between icon and label -->
  <rect x="${W * 0.46}" y="${H / 2 - 60}" width="4" height="120" rx="2" fill="${accent}" opacity="0.55" />

  <!-- pillar label + brand mark, right side -->
  <text x="${W * 0.52}" y="${H / 2 - 6}" font-family="Arial, sans-serif"
        font-size="30" font-weight="700" fill="${accent}" letter-spacing="4">${escapeXml(pillarLabel)}</text>
  <text x="${W * 0.52}" y="${H / 2 + 34}" font-family="Georgia, 'Times New Roman', serif"
        font-size="24" font-weight="700" fill="${PALETTE.offwhite}" opacity="0.85" letter-spacing="1">MONEY MATTERS DAILY</text>
  ${keyMark(W * 0.52 + 18, H / 2 + 88, 34, PALETTE.offwhite)}
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
    pillar: data.pillar,
    slug,
    pinIcon: data.pinIcon,
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1600 } });
  const png = resvg.render().asPng();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${slug}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`wrote ${path.relative(ROOT, outPath)}`);
  return outPath;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/generate-hero.mjs <slug-or-path> [...] | --all');
  process.exit(1);
}

const files = args[0] === '--all' ? allPostFiles() : args.map(resolvePostFile);
for (const f of files) generateOne(f);
