// Shared brand palette, pillar icon illustrations, and small SVG-building
// helpers used by both scripts/generate-pin.mjs (Pinterest pins) and
// scripts/generate-hero.mjs (in-post hero banners). Single source of truth
// so the two visual systems can't quietly drift apart — a new pillar icon
// or a palette tweak here updates both.
//
// Nothing in this file touches the filesystem or does any post-specific
// layout — it's pure drawing/data helpers, safe to import from any script.

export const PALETTE = {
  bg: '#1c4a4a',
  bgLight: '#245c5c',
  gold: '#c9a875',
  offwhite: '#e8edf2',
  midTeal: '#5b8a8a',
  lightTeal: '#a8c9c9',
};

export const PILLAR_LABELS = {
  budgeting: 'BUDGETING',
  saving: 'SAVING',
  credit: 'CREDIT',
  'investing-basics': 'INVESTING BASICS',
  'app-comparisons': 'APP COMPARISONS',
  'travel-finance': 'TRAVEL & NOMAD FINANCES',
  'news-trends': 'NEWS & TRENDS',
};

export const PILLAR_ACCENTS = {
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
// same visual (stable in git diffs) but different posts diverge from each other.
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

export function makeRng(slug) {
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

export const ICONS = {
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
  gauge(accent, offwhite) {
    // Speedometer-style dial with tick marks and a needle — old-car gauge look.
    const r = 78;
    const ticks = [-90, -45, 0, 45, 90].map((deg) => {
      const rad = ((deg - 90) * Math.PI) / 180;
      const x1 = (r - 14) * Math.cos(rad);
      const y1 = (r - 14) * Math.sin(rad);
      const x2 = r * Math.cos(rad);
      const y2 = r * Math.sin(rad);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
    }).join('\n        ');
    const needleDeg = 35; // points up and to the right, toward the "high" end
    const needleRad = ((needleDeg - 90) * Math.PI) / 180;
    const needleX = (r - 22) * Math.cos(needleRad);
    const needleY = (r - 22) * Math.sin(needleRad);
    return `
      <g fill="none" stroke="${offwhite}" stroke-width="6" stroke-linecap="round">
        <path d="M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0" opacity="0.9" />
        ${ticks}
        <line x1="0" y1="0" x2="${needleX.toFixed(1)}" y2="${needleY.toFixed(1)}" stroke="${accent}" stroke-width="7" />
        <circle cx="0" cy="0" r="9" fill="${accent}" stroke="${offwhite}" stroke-width="3" />
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

export function iconFor(pillar, iconKey) {
  if (iconKey && ICONS[iconKey]) return ICONS[iconKey];
  return ICONS[pillar] ?? ICONS.budgeting;
}

// ---------------------------------------------------------------------------
// Alternate icon-area visuals — flow chain and small table. Equation and
// plain modes need no extra markup beyond what the caller already builds.
// ---------------------------------------------------------------------------

export function buildFlowVisual(steps, accent, offwhite, centerY) {
  const clean = (steps && steps.length ? steps : ['Step one', 'Step two', 'Step three']).slice(0, 4);
  const n = clean.length;
  const margin = 40;
  const gap = 24;
  const boxW = Math.min(230, (1000 - margin * 2 - gap * (n - 1)) / n);
  const boxH = 84;
  const totalW = n * boxW + (n - 1) * gap;
  const startX = 500 - totalW / 2;
  const fontSize = boxW < 180 ? 20 : 24;
  const wrapChars = boxW < 180 ? 13 : 16;

  const boxes = clean.map((label, i) => {
    const x = startX + i * (boxW + gap);
    const lines = wrapText(label, wrapChars).slice(0, 2);
    const lineHeight = fontSize * 1.2;
    const textStartY = centerY - ((lines.length - 1) * lineHeight) / 2 + fontSize / 3;
    const tspans = lines
      .map((line, li) => `<tspan x="${x + boxW / 2}" y="${textStartY + li * lineHeight}">${escapeXml(line)}</tspan>`)
      .join('\n        ');
    const arrow =
      i < n - 1
        ? `<path d="M ${x + boxW + 8} ${centerY} L ${x + boxW + gap - 8} ${centerY}" stroke="${accent}" stroke-width="4" marker-end="url(#arrowhead)" />`
        : '';
    return `
      <rect x="${x}" y="${centerY - boxH / 2}" width="${boxW}" height="${boxH}" rx="12" fill="${offwhite}" opacity="0.1" />
      <rect x="${x}" y="${centerY - boxH / 2}" width="${boxW}" height="${boxH}" rx="12" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.75" />
      <text text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${fontSize}" fill="${offwhite}">
        ${tspans}
      </text>
      ${arrow}`;
  });

  return `
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="${accent}" />
      </marker>
    </defs>
    ${boxes.join('\n')}`;
}

export function buildTableVisual(rows, accent, offwhite, centerY) {
  const clean = (rows && rows.length ? rows : [{ label: 'Label', value: 'Value' }]).slice(0, 3);
  const rowH = 74;
  const tableW = 620;
  const tableH = clean.length * rowH;
  const startY = centerY - tableH / 2;
  const x = 500 - tableW / 2;
  const fontSize = 30;

  const rowsMarkup = clean.map((row, i) => {
    const y = startY + i * rowH;
    const stripe = i % 2 === 0 ? 0.1 : 0.04;
    return `
      <rect x="${x}" y="${y}" width="${tableW}" height="${rowH}" fill="${offwhite}" opacity="${stripe}" />
      <text x="${x + 28}" y="${y + rowH / 2 + fontSize / 3}" font-family="Arial, sans-serif" font-weight="600" font-size="${fontSize}" fill="${offwhite}" opacity="0.9">${escapeXml(row.label)}</text>
      <text x="${x + tableW - 28}" y="${y + rowH / 2 + fontSize / 3}" text-anchor="end" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="${fontSize}" fill="${accent}">${escapeXml(row.value)}</text>`;
  });

  return `
    <rect x="${x}" y="${startY}" width="${tableW}" height="${tableH}" rx="10" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.7" />
    ${clean
      .slice(0, -1)
      .map((_, i) => {
        const y = startY + (i + 1) * rowH;
        return `<line x1="${x}" y1="${y}" x2="${x + tableW}" y2="${y}" stroke="${accent}" stroke-width="1.5" opacity="0.4" />`;
      })
      .join('\n      ')}
    ${rowsMarkup.join('\n')}`;
}

export function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Rough word-wrap by estimated character width. Good enough for a review
// draft — a human approves (and can tweak) before anything goes live.
export function wrapText(text, maxCharsPerLine) {
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

export function scatterDots(rng, accent, offwhite, band) {
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
// site favicon, recolored for legibility on the dark background (used on
// both pins and heroes, which don't have a dark-mode media query available
// like favicon.svg has). Coordinates below are the header/favicon key
// shape, re-centered on its own bow (9,8 -> 0,0) so it's easy to place and
// scale.
export function keyMark(cx, bottomY, height, color) {
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
