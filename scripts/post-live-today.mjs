#!/usr/bin/env node
// Prints "true" if a non-draft post carries today's (UTC) pubDate, else "false".
// Used by .github/workflows/daily-post-reminder.yml. No dependencies, so the
// workflow doesn't need npm install. With scheduled publishing, a post's file
// is usually committed days before its pubDate, so "was a file added today"
// (the old check) is no longer the right question.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'src/content/blog');
const today = process.env.SITE_NOW ? process.env.SITE_NOW.slice(0, 10) : new Date().toISOString().slice(0, 10);

const live = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).some((f) => {
  const fm = (fs.readFileSync(path.join(dir, f), 'utf-8').match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
  const date = (fm.match(/^pubDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m) || [])[1];
  const draft = /^draft:\s*true\s*$/m.test(fm);
  return date === today && !draft;
});
console.log(live ? 'true' : 'false');
