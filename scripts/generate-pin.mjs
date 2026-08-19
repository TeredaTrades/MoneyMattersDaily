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

// ---------------------------------------------------------------------------
// Seeded RNG — deterministic per slug, so a given post always regenerates the
// same pin (stable in git diffs) but different posts diverge from each other.
// ---------------------------------------------------------------------------

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(slug) {
  const rng = mulberry32(hashStr(slug));
  return {
    range(min, max) {
      return min + rng() * (max - min);
    },
    int(min, max) {
      return Math.floor(min + rng() * (max - min + 1));
    },
    pick(arr) {
      return arr[Math.floor(rng() * arr.length)];
    },
  };
}

// ---------------------------------------------------------------------------
// Pillar icons — simple original line-art, drawn in a local -100..100 box.
// Caller wraps each in a <g transform="translate(...) rotate(...) scale(...)">.
// ---------------------------------------------------------------------------

function arcWedge(cx, cy, r, startDeg, endDeg) {
  const toRad = (d) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

const ICONS = {
  budgeting(accent, offwhite) {
    // Pie chart — allocation across categories.
    return `
      <g stroke="${offwhite}" stroke-width="5" stroke-linejoin="round">
        <path d="${arcWedge(0, 0, 72, 0, 160)}" fill="${accent}" opacity="0.9" />
        <path d="${arcWedge(0, 0, 72, 160, 260)}" fill="${offwhite}" opacity="0.55" />
        <path d="${arcWedge(0, 0, 72, 260, 360)}" fill="${accent}" opacity="0.45" />
        <circle cx="0" cy="0" r="72" fill="none" stroke="${offwhite}" stroke-width="5" opacity="0.8" />
      </g>`;
  },
  saving(accent, offwhite) {
    // Piggy bank.
    return `
      <g fill="none" stroke="${offwhite}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="-5" cy="8" rx="68" ry="44" fill="${accent}" opacity="0.85" stroke="${offwhite}" />
        <polygon points="-52,-28 -70,-52 -34,-38" fill="${accent}" opacity="0.85" />
        <circle cx="58" cy="10" r="15" fill="${accent}" opacity="0.85" />
        <circle cx="63" cy="4" r="3" fill="${offwhite}" stroke="none" />
        <line x1="-15" y1="-34" x2="10" y2="-34" stroke="${offwhite}" />
        <line x1="-42" y1="48" x2="-42" y2="66" />
        <line x1="-14" y1="52" x2="-14" y2="70" />
        <line x1="20" y1="52" x2="20" y2="70" />
        <circle cx="-8" cy="-68" r="12" fill="none" stroke="${accent}" />
        <line x1="-8" y1="-56" x2="-8" y2="-44" stroke="${accent}" />
      </g>`;
  },
  credit(accent, offwhite) {
    // Credit card.
    return `
      <g fill="none" stroke="${offwhite}" stroke-width="6" stroke-linejoin="round">
        <rect x="-85" y="-52" width="170" height="104" rx="14" fill="${accent}" opacity="0.18" />
        <rect x="-85" y="-52" width="170" height="104" rx="14" />
        <rect x="-85" y="-22" width="170" height="20" fill="${offwhite}" opacity="0.75" stroke="none" />
        <rect x="-62" y="18" width="34" height="24" rx="4" fill="${accent}" stroke="${accent}" stroke-width="3" opacity="0.9" />
        <circle cx="30" cy="30" r="20" fill="none" stroke="${accent}" stroke-width="5" opacity="0.85" />
        <circle cx="48" cy="30" r="20" fill="none" stroke="${offwhite}" stroke-width="5" opacity="0.6" />
      </g>`;
  },
  'investing-basics'(accent, offwhite) {
    // Rising bar chart with a trend arrow.
    return `
      <g stroke="${offwhite}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <rect x="-78" y="20" width="30" height="50" fill="${accent}" opacity="0.55" stroke="none" />
        <rect x="-38" y="0" width="30" height="70" fill="${accent}" opacity="0.7" stroke="none" />
        <rect x="2" y="-28" width="30" height="98" fill="${accent}" opacity="0.85" stroke="none" />
        <rect x="42" y="-55" width="30" height="125" fill="${accent}" stroke="none" />
        <line x1="-85" y1="72" x2="85" y2="72" />
        <path d="M -70 30 L -20 -5 L 15 15 L 60 -60" stroke="${offwhite}" />
        <polygon points="60,-60 40,-58 58,-40" fill="${offwhite}" stroke="none" />
      </g>`;
  },
  'app-comparisons'(accent, offwhite) {
    // Phone with a checklist.
    return `
      <g fill="none" stroke="${offwhite}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <rect x="-42" y="-85" width="84" height="150" rx="16" fill="${accent}" opacity="0.15" />
        <rect x="-42" y="-85" width="84" height="150" rx="16" />
        <line x1="-16" y1="-95" x2="16" y2="-95" stroke-width="8" opacity="0.6" />
        <polyline points="-25,-45 -16,-36 2,-58" stroke="${accent}" stroke-width="6" />
        <line x1="12" y1="-45" x2="28" y2="-45" opacity="0.7" />
        <polyline points="-25,-15 -16,-6 2,-28" stroke="${accent}" stroke-width="6" />
        <line x1="12" y1="-15" x2="28" y2="-15" opacity="0.7" />
        <polyline points="-25,15 -16,24 2,2" stroke="${accent}" stroke-width="6" />
        <line x1="12" y1="15" x2="28" y2="15" opacity="0.7" />
      </g>`;
  },
  'travel-finance'(accent, offwhite) {
    // Globe with a paper-airplane path.
    return `
      <g fill="none" stroke="${offwhite}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="-15" cy="10" r="58" opacity="0.9" />
        <ellipse cx="-15" cy="10" rx="58" ry="22" opacity="0.55" />
        <ellipse cx="-15" cy="10" rx="22" ry="58" opacity="0.55" />
        <line x1="-73" y1="10" x2="43" y2="10" opacity="0.55" />
        <polygon points="48,-62 78,-30 52,-38 40,-16 32,-40" fill="${accent}" stroke="${accent}" stroke-width="3" />
      </g>`;
  },
  'news-trends'(accent, offwhite) {
    // Megaphone with sound arcs.
    return `
      <g fill="none" stroke="${offwhite}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="-70,-8 -20,-38 -20,38 -70,8" fill="${accent}" opacity="0.85" stroke="${offwhite}" />
        <rect x="-84" y="-14" width="16" height="28" rx="4" fill="${accent}" opacity="0.85" />
        <path d="M -20 -38 L 55 -60 L 55 60 L -20 38" />
        <path d="M 70 -20 A 30 30 0 0 1 70 20" opacity="0.7" />
        <path d="M 85 -32 A 48 48 0 0 1 85 32" opacity="0.4" />
      </g>`;
  },
};

function iconFor(pillar) {
  return ICONS[pillar] ?? ICONS.budgeting;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

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

function scatterDots(rng, accent, offwhite, band) {
  const count = rng.int(3, 6);
  const dots = [];
  for (let i = 0; i < count; i++) {
    const x = rng.range(70, 930);
    const y = rng.range(band[0], band[1]);
    const r = rng.range(3, 9);
    const color = rng.pick([accent, offwhite]);
    const opacity = rng.range(0.12, 0.4).toFixed(2);
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}" opacity="${opacity}" />`);
  }
  return dots.join('\n      ');
}

// Brand mark — same key icon as PillarIcon.astro's construction and the
// site favicon, recolored offwhite for legibility on the dark pin background
// (this is a static pin PNG, no dark-mode media query available like
// favicon.svg has). Coordinates below are the header/favicon key shape,
// re-centered on its own bow (9,8 -> 0,0) so it's easy to place and scale.
function keyMark(cx, bottomY, height, color) {
  const scale = height / 17.5; // source bbox is ~17.5 units tall
  const x = cx;
  const y = bottomY - 12 * scale;
  return `
  <g transform="translate(${x} ${y}) scale(${scale.toFixed(3)})" fill="none" stroke="${color}" stroke-width="1.7">
    <circle cx="0" cy="0" r="5.5" />
    <path d="M0,5.5 L0,12 M0,12 L3.5,12 M0,9 L2.5,9" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="0" cy="0" r="1.7" />
  </g>`;
}

function buildSvg({ title, pillar, slug, equation }) {
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
  // color) still land differently on the page.
  const iconRotation = rng.range(-7, 7);
  const iconOffsetX = rng.range(-40, 40);
  const iconScale = rng.range(0.92, 1.12);
  const iconCenterX = W / 2 + iconOffsetX;
  const iconCenterY = 470;
  const iconMarkup = iconFor(pillar)(accent, PALETTE.offwhite);

  const topDots = scatterDots(rng, accent, PALETTE.lightTeal, [255, 320]);
  const bottomDots = scatterDots(rng, accent, PALETTE.lightTeal, [1140, 1290]);

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

  <!-- pillar icon (varies per post via seeded rotation/offset/scale) -->
  <g transform="translate(${iconCenterX.toFixed(1)} ${iconCenterY}) rotate(${iconRotation.toFixed(1)}) scale(${iconScale.toFixed(2)})">
    ${iconMarkup}
  </g>

  ${equation ? `
  <!-- optional equation, sits in the gap between icon and title -->
  <rect x="${W / 2 - 230}" y="600" width="460" height="66" rx="10" fill="${PALETTE.offwhite}" opacity="0.08" />
  <rect x="${W / 2 - 230}" y="600" width="460" height="66" rx="10" fill="none" stroke="${accent}" stroke-width="2" opacity="0.6" />
  <text x="${W / 2}" y="643" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="34" font-weight="700" fill="${PALETTE.offwhite}">${escapeXml(equation)}</text>` : ''}

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
  const svg = buildSvg({ title: data.title, pillar: data.pillar, slug, equation: data.equation });
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
