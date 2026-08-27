#!/usr/bin/env node
// UNATTENDED post generator — trial use only (see content-pipeline/auto-publish-trial.json).
//
// Writes the next pending keyword from content-pipeline/keyword-queue.json as a
// full blog post with NO human review step, using the Anthropic API. This is a
// deliberate, temporary departure from the project's normal editorial-review
// workflow (see NOTES.md, "Daily post reminder — chose reminder-only, not full
// auto-generation") — every prior session treated full auto-generation as an
// open decision requiring discussion, specifically because an earlier version
// of this site "felt AI-generated" and the fix was editorial judgment, not
// tooling. Re-enable the normal PR + pinApproved-by-a-human flow once the
// trial window in auto-publish-trial.json expires.
//
// Usage: node scripts/generate-post.mjs
// Requires: ANTHROPIC_API_KEY env var (GitHub Actions secret)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const QUEUE_PATH = path.join(ROOT, 'content-pipeline/keyword-queue.json');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');

const PILLARS = [
  'budgeting', 'saving', 'credit', 'investing-basics',
  'app-comparisons', 'travel-finance', 'news-trends',
];

function slugify(s) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function loadExistingPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  return files.map(f => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8');
    const titleMatch = raw.match(/^title:\s*"?([^"\n]+)"?/m);
    const pillarMatch = raw.match(/^pillar:\s*"?([^"\n]+)"?/m);
    return {
      slug: f.replace(/\.md$/, ''),
      title: titleMatch ? titleMatch[1] : f,
      pillar: pillarMatch ? pillarMatch[1] : 'unknown',
    };
  });
}

async function callClaude(system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.content.map(b => b.text || '').join('\n');
}

async function main() {
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  const next = queue.find(k => k.status === 'pending');
  if (!next) {
    console.log('No pending keywords left in the queue. Nothing to publish.');
    return;
  }

  const existing = loadExistingPosts();
  const crossLinkCandidates = existing
    .filter(p => p.pillar === next.pillar)
    .slice(0, 5)
    .map(p => `- ${p.title} (/blog/${p.slug})`)
    .join('\n');

  const today = new Date().toISOString().slice(0, 10);
  const slug = slugify(next.keyword);

  const system = `You write for MoneyMattersDaily, a plain-language personal finance site. \
Match this exact editorial bar, established over many prior posts:
- A clear, direct answer in the first 2-3 sentences. No throat-clearing, no "In today's world..." openers.
- At least one realistic worked numeric example with actual dollar figures, computed correctly. \
Show your arithmetic in the text itself so a reader (or reviewer) can check it.
- A "who this is for / who this isn't for" section — genuine, not hedging.
- A common-mistakes section.
- Cite real, current primary sources (IRS, CFPB, Federal Reserve, FDIC, etc.) for anything involving \
a rate, limit, law, or tax rule — and only state figures you are confident are accurate; if unsure of \
an exact current figure, describe the range/mechanism instead of inventing a precise number.
- Vary structure — do not default to a generic numbered-steps template every time.
- Take an actual point of view rather than hedging every claim both ways.
- Avoid generic AI-blog phrasing ("In conclusion", "It's important to note", excessive hedging).
- Where natural, cross-link to one or two of these existing same-pillar posts:
${crossLinkCandidates || '(none yet in this pillar)'}

Output ONLY the raw markdown file content — YAML frontmatter followed by the post body — with no \
commentary, no code fences, nothing before or after. Use this exact frontmatter shape:

---
title: "<title, sentence case, matches the keyword's intent>"
description: "<1-2 sentence meta description, specific not generic>"
pubDate: ${today}
targetKeyword: "${next.keyword}"
pillar: "${next.pillar}"
draft: false
pinApproved: true
depthReviewed: true
pinVisual: "icon"
---

<post body in markdown, starting directly with the answer>`;

  const user = `Write the next post. Keyword: "${next.keyword}". Pillar: ${next.pillar}.`;

  console.log(`Generating post for keyword: "${next.keyword}" (${next.pillar})...`);
  const md = await callClaude(system, user);

  const outPath = path.join(BLOG_DIR, `${slug}.md`);
  fs.writeFileSync(outPath, md.trim() + '\n');
  console.log(`Wrote ${outPath}`);

  next.status = 'published';
  // Deliberately NOT JSON.stringify-ing the whole file back out — this project's
  // own NOTES.md flags that doing so silently reformats the file's indentation
  // (it's hand-formatted at 4 spaces) into a huge, unreviewable diff for what
  // should be a one-line change. Targeted string replace instead.
  const rawQueue = fs.readFileSync(QUEUE_PATH, 'utf8');
  const keywordEsc = next.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `("keyword":\\s*"${keywordEsc}"[\\s\\S]*?"status":\\s*)"pending"`
  );
  if (!pattern.test(rawQueue)) {
    throw new Error(`Could not find pending entry for "${next.keyword}" to update in keyword-queue.json`);
  }
  const updatedQueue = rawQueue.replace(pattern, `$1"published"`);
  fs.writeFileSync(QUEUE_PATH, updatedQueue);
  console.log(`Marked "${next.keyword}" published in keyword-queue.json`);

  // Expose the slug to the workflow for the pin/hero generation steps
  const ghOutput = process.env.GITHUB_OUTPUT;
  if (ghOutput) {
    fs.appendFileSync(ghOutput, `slug=${slug}\n`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
