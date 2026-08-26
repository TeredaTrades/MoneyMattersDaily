# Project notes / decision log

> **⚠️ READ THIS FIRST:** Entries are newest-first. The section
> immediately below this line is the current state of the project.
> Do NOT scroll to the bottom for "the latest" — that's the oldest
> entry, from the very first setup session. A status check done
> against the bottom of this file on 2026-08-19 produced several
> incorrect "still open" items that had actually been resolved days
> earlier — see the "HTTPS confirmed live; correcting a stale status
> check" entry below for what that looked like and why it happened.
> When in doubt, check the date on the entry, not its position.

Running log of setup decisions and open items. Newest entries at top.

## 2026-08-26 — Wrote "Compound Interest Explained Simply"; investigated pin-not-showing report (resolved) and found a real gap (open)

### What we did
- Next pending item in `content-pipeline/keyword-queue.json` was "compound
  interest explained simply" (investing-basics pillar). Written with the
  depth treatment applied from the start (worked numeric examples, common
  mistakes, who-this-is-for), rather than as a later retrofit pass.
  Covers the A = P(1 + r/n)^(nt) formula, why compounding frequency
  matters far less than rate/time once the rate is fixed, and an
  early-vs-late investor worked example. The early-vs-late numbers were
  computed in Python before publishing (verified precisely: Investor A
  ≈ $252,418, Investor B ≈ $226,706 — an earlier draft had A off by
  about $7k from eyeballing it, caught and corrected before commit).
- Used the new `pinVisual: "equation"` mode (added on the credit-utilization
  post) with `equation: "A = P(1 + r/n)^(nt)"` — first post to use it since
  it landed.
- Cross-linked to `index-funds-explained-for-beginners` (compounding is the
  mechanical reason that post's "stay invested" advice works).
- Followed the normal `post/<slug>` branch + PR flow (PR #28) per the note
  left in the prior session — no repeat of the direct-to-main shortcut.
- Learned the hard way: piping `keyword-queue.json` through Python's
  `json.dump` with `indent=2` silently reformatted the *entire* file from
  its original 4-space indentation, producing a 300+ line diff for a
  1-line status change. Caught before pushing (diff review), fixed by
  reverting the file and editing just the one `"status"` field with
  `str_replace` instead. **For next time:** never round-trip this file
  through a JSON library for a single-field edit — use a direct string
  replace so the diff stays proportional to the change.

### Pin investigation (started, then partly overtaken by events)
User reported yesterday's and the day-before's pins hadn't shown up on
Pinterest. Investigation found two different things:
- **credit-utilization-explained** (2 days old at the time): frontmatter,
  feed, and deploy all checked out fine — user confirmed mid-session that
  this one has since pinned. Nothing was actually wrong here; same normal
  RSS latency as the prior credit-post investigation, just a longer wait
  this time.
- **how-to-start-investing-with-little-money** (investing-basics pillar):
  found a real, still-open gap while checking `scripts/generate-pinterest-feed.mjs`
  — `PILLAR_BOARDS['investing-basics']` has been marked "no board created
  on Pinterest yet as of this writing" since it was added. The feed itself
  generates correctly (confirmed both this post and compound-interest-
  explained-simply are in `pinterest-feed-investing-basics.xml`), but with
  no board connected on the Pinterest side, nothing in that feed can ever
  auto-publish regardless of latency. **This is a "create the board and
  connect the feed" action item on the Pinterest UI side, not a code fix**
  — flagged to the user, not yet actioned as of this entry.

### Open items
- **Investing Basics Pinterest board still not created/connected** — new
  this session, blocks pinning for that entire pillar (now 3 posts deep:
  index-funds, how-to-start-investing, compound-interest).
- Pillar pages in GSC still not checked/submitted (carried over).
- Auto-publish scheduling still doesn't exist (carried over).

---

## 2026-08-25 (later) — Published "How to Start Investing With Little Money" + pin, direct to main (no PR)

### What we did
- Wrote and published `how-to-start-investing-with-little-money.md`
  (investing-basics pillar) — next keyword in the queue. Follows the
  depth-treatment template established on credit-utilization-explained:
  worked example, common mistakes, and an explicit "who this is for /
  who should wait" section rather than hedging for everyone.
- Content covers the actual order of operations (employer match → small
  cushion → high-interest debt → investing), why fractional shares +
  $0-minimum accounts make small amounts realistic now, and why a Roth
  IRA is worth prioritizing early given penalty-free contribution
  withdrawals. Cross-links to the index-funds-explained post for the
  "what fund" question this one deliberately doesn't re-explain.
- **Skipped the normal PR flow at the user's request this session** —
  `pin-preview.yml` and `x-draft.yml` only trigger on `pull_request`,
  so both were run locally instead (`node scripts/generate-pin.mjs`,
  `node scripts/generate-x-drafts.mjs --all`) and committed straight to
  `main` alongside the post. `pinApproved: true` and `depthReviewed:
  true` set directly in frontmatter rather than via the usual separate
  review/approval commit.
- Marked the keyword `published` in `content-pipeline/keyword-queue.json`.
- Confirmed `npm run build` succeeds and the post's route generates
  correctly before pushing.

### Note for next session
This was a one-off to skip review latency, not a new default — future
posts should go back through the normal `post/<slug>` branch + PR flow
(gets the pin/X-draft bot commits and a review point before merge)
unless told otherwise again.

---

## 2026-08-25 — Investigated "pin hasn't shown up" for credit-utilization-explained; confirmed everything correct, just Pinterest's normal processing window

Checked why the credit-utilization-explained pin hadn't appeared on the
Building Credit board yet. Traced the whole chain and found nothing
wrong:

- `credit-utilization-explained.md` has `pinApproved: true` and its pin
  PNG exists at `public/pins/credit-utilization-explained.png`.
- `generate-pinterest-feed.mjs` correctly includes it — confirmed by
  fetching the live `pinterest-feed-credit.xml` directly and seeing the
  post's title/link/description/pubDate/enclosure all present.
- The "Deploy to GitHub Pages" workflow run right after PR #27 merged
  (2026-08-24 14:24 UTC) succeeded, so the live feed reflects this.
- The credit feed's RSS auto-publish connection on the Pinterest side
  was already saved/active (confirmed — the Save-button appearance on
  revisiting Settings > Bulk Create Pins > Edit was just from reopening
  the editor, not an unsaved state).

**Conclusion: this was never broken — it's Pinterest's normal RSS
processing latency.** Per Pinterest's own help docs, once a feed is
connected, new items get turned into pins within roughly **24 hours**
of the feed updating (some third-party sources say up to 24-48h).
Deploy landed 14:24 UTC 08-24, so as of this check it was still well
inside that window.

**For next time:** if a pin seems to be "stuck" after a post is
merged and `pinApproved: true`, check in this order before assuming
something's broken: (1) frontmatter has `pinApproved: true` and a pin
PNG exists, (2) the live `pinterest-feed-<pillar>.xml` actually lists
the post, (3) the deploy workflow succeeded after that merge, (4) the
board's feed connection is still active in Pinterest Settings > Bulk
Create Pins. If all four check out, the fix is just to wait — give it
the full ~24h from deploy time before treating it as an actual
problem. Check the board itself (not the settings/feed-editor screen)
to confirm once it lands.

### Open items
- Pillar pages in GSC still not checked/submitted (carried over).
- Auto-publish scheduling still doesn't exist (carried over).

---



Next pending item in `content-pipeline/keyword-queue.json` was "credit
utilization explained" (credit pillar). Written, verified with a local
`npm run build`, opened as **PR #26** (`post/credit-utilization-explained`
branch) and merged. Covers per-card vs. overall utilization and the
statement-closing-date mechanic (the timing quirk that trips people up
more than the concept itself). Queue entry marked `published`; pending
count is now **19** (not 20 as the prior entry's correction note said —
that count was accurate as of 08-23, one item dropped off when this post
published).

**New pin icon**: `scripts/generate-pin.mjs` gained a `gauge`
(speedometer) icon variant, plus a `pinIcon` frontmatter field so a post
can request a specific icon instead of falling back to the pillar
default. Used on this post (`pinIcon: "gauge"`) since utilization-as-a-
lever is a natural fit for a gauge visual, and to keep pin variety going
per the "don't repeat visual types back-to-back" guidance from the prior
credit post.

**Pin approval investigated and resolved**: the pin hadn't reached
Pinterest. Traced the chain — every generated post defaults to
`pinApproved: false` (intentional human-review gate before anything
publishes to Pinterest); `scripts/generate-pinterest-feed.mjs` only
includes posts in `public/pinterest-feed-<pillar>.xml` where
`pinApproved: true`; Pinterest's Bulk Create Pins auto-publish reads
from those feed URLs, so a post at `pinApproved: false` simply never
appears there — not a bug, the same manual gate every prior post has
gone through. Reviewed the generated pin (teal/gold, gauge icon, title
fits, URL footer present) — looked clean, so flipped `pinApproved` to
`true` and committed on this branch (pin image already existed at
`public/pins/credit-utilization-explained.png`).

### Open items
- Pillar pages in GSC still not checked/submitted (carried over,
  still genuinely open).
- Auto-publish scheduling still doesn't exist (carried over from
  08-23 entry — worth a real discussion rather than solving ad hoc).

---

## 2026-08-23 (technically — 03:00-ish, before the calendar day proper) — Daily post: what hurts your credit score

Published a day early / at the very edge of the day, since the user
flagged they'd be unavailable most of tomorrow and likely too tired in
the evening — no auto-publish scheduling exists yet (only
`daily-post-reminder.yml`, which opens a reminder issue at 14:00 UTC,
not an actual publish), so doing it now at the start of the day was the
practical call rather than risk missing it or rushing full publish
automation together at 3am. Next pending item in
`content-pipeline/keyword-queue.json` in order was "what hurts your
credit score" (credit pillar) — written, verified with a full local
`npm run build` (no errors, internal links resolve), opened as **PR #23**
(`post/what-hurts-your-credit-score` branch), `pinApproved` left `false`
pending pin review. Queue entry marked `published`.

Structured around FICO's actual factor weights (payment history 35%,
utilization 30%, length of history 15%, credit mix 10%, new credit 10%)
rather than a generic tips list, plus a dedicated myths section (checking
your own score, income, carrying a balance on purpose, debit card
activity — none of which affect the score) since myth-correction is a
different value proposition than the existing how-to-build-credit post.
Also covered two real 2026-specific developments: rent/utility
reporting (Experian Boost, RentTrack, Esusu) and BNPL plans increasingly
being reported to bureaus — sourced from current 2026 credit-scoring
coverage rather than older general knowledge. Added a reverse cross-link
from `how-to-build-credit-from-scratch.md` to this post. `pinVisual` left
at default (`icon`) since the two posts immediately prior both used
`table`, per the "don't repeat visual types back-to-back" guidance.

### Open items
- PR #23 not yet merged.
- Auto-publish scheduling still doesn't exist — worth a real discussion
  later about whether it's worth building (would mean removing/reducing
  the human review step that currently sits before every post goes
  live), rather than solving it ad hoc at 3am again next time.
- **Correction (added 2026-08-24):** the items below were carried
  over from prior entries but several were already stale even at the
  time this entry was written, due to an unlogged session earlier the
  same day — see the reconstructed entry directly below this one for
  what actually happened and when. PR #19 and #18 were in fact already
  merged (confirmed via `git log` / GitHub: 0 open PRs). The reverse
  cross-link from 50/30/20 → zero-based-budgeting was already added.
  Content-depth treatment had already been extended to more posts than
  "a handful" by this point. Item 3 from the 08-20 feedback was in fact
  acted on (broadened the queue + added 2 pillars) — see the resolution
  note in the reconstructed entry below. The queue also grew well past
  4 items: 20 pending as of 2026-08-24, across all 7 pillars now.
  Genuinely still open: pillar pages in GSC still not checked/
  submitted.

---

## 2026-08-22 (cont. 2), 11:33–12:14 UTC — Reconstructed entry: keyword batch, cross-link, depth treatment batch 2, GoatCounter, two-tier depth tracking

> **Note:** This entry was written after the fact, on 2026-08-24, by
> reconstructing from commit history — it was not logged at the time.
> The actual work is confirmed real and merged directly to `main`
> (no PR trail for these, unlike the PR-based post workflow); the
> narrative below is inferred from commit messages/diffs, not from a
> live session note, so it may be thinner on the "why" than other
> entries.

Six changes landed in this window, after the Pinterest RSS investigation
entry below and before that evening's credit-score post session:

- **Keyword queue**: added 9 keywords to balance pillars (saving,
  app-comparisons, travel-finance, news-trends — travel-finance and
  news-trends are new pillars not in the original 5), then a further 7
  keywords covering irregular-income, cross-border, financial-systems-
  sequence, and tool-led-guide angles, sourced from the Aug 20 feedback.
  Commit message notes site direction was kept broad rather than
  narrowed in response to that feedback.
- **Reverse cross-link**: added from `50-30-20-budget-rule-explained.md`
  to zero-based-budgeting, closing the item that had been sitting open
  in prior entries.
- **Depth treatment batch 2**: extended the worked-example/common-
  mistakes/who-this-is-for treatment to 4 more posts — emergency fund,
  budget for beginners, envelope method, 50/30/20 — on top of the 2
  covered in PR #18.
- **GoatCounter analytics**: added a tracking script to the base layout,
  pointed at `mmd.goatcounter.com`.
- **Two-tier publishing tracking**: added a `depthReviewed` field to the
  content schema plus an `npm run content:depth-status` script, so new
  posts default to `depthReviewed: false` and the depth-treatment
  backlog is visible in tooling instead of tracked ad hoc in this file.
  Backfilled `true` on the 8 posts that already had full treatment at
  that point.

### Item 3 of the 08-20 feedback (content direction) — closing out
Reading the commit evidence together with the 2026-08-24 conversation:
this session's keyword batches were the actual (if unlogged) response
to item 3 from the 08-20 friend feedback below. Rather than narrowing
the site to a few practical angles, the direction taken was to
broaden — all four suggested angles (irregular income, cross-border/
money-across-borders, beginner financial-systems sequence, tool-led
guides) were taken in as new queued keywords, and the cross-border
angle grew into two new pillars (travel-finance, news-trends). Pillar
list is now 7, not 5: budgeting, saving, credit, investing-basics,
app-comparisons, travel-finance, news-trends. Closing item 3 as
decided/acted-on rather than "not yet discussed."

### Open items
- Confirm whether any other unlogged work exists beyond this window —
  this reconstruction was triggered by finding this specific gap, not
  by an exhaustive audit of the whole history.

---

## 2026-08-22 (cont.) — Investigated why Pinterest wasn't showing new pins

### Context
After approving pins for 4 backlogged posts (see entry below) plus the
day's new post, none of the boards showed any movement — every board
stayed frozen at the exact same pin count/age ("3d") from when the
feeds were first connected on 2026-08-18/19, even hours after multiple
merges to `main`. Investigated end-to-end rather than assuming either
"just wait" or "something's broken," since both were plausible.

### Ruled out, in order
1. **Deploy pipeline** — confirmed `deploy.yml` runs on every push to
   `main` and the specific deployments for both approval PRs (#20, #21)
   show `success` via the GitHub deployments API, with a live
   `environment_url`.
2. **Feed file correctness** — regenerated locally and diffed; the
   `pinterest-feed-saving.xml` content, then confirmed live in-browser:
   valid RSS 2.0, correct `<link>`, `<guid>`, `<description>`, `<pubDate>`
   (newest first), and `<enclosure>` pointing at the right PNG for all 3
   saving-pillar posts. No malformed XML, no trailing-slash mismatch
   (the `trailingSlash: 'always'` config from PR #13 only affects
   Astro-routed pages — files under `public/`, including every
   `pinterest-feed-*.xml` and every pin PNG, are served as raw static
   assets with no routing applied, so that fix is unrelated to this).
3. **"Feeds were never actually connected" theory** — this looked
   likely at first (board-level "Edit info and settings" has no RSS
   option at all — confirmed by screenshot, that panel is just cover/
   name/description/privacy/collaborators/personalization/delete).
   Turned out to be a UI location issue, not a missing setup: Pinterest
   puts RSS auto-publish at the **account** level, not per-board, under
   Settings → **Import content → Bulk create Pins → Auto-publish**.
   Checked there and **all 7 pillar feed URLs are already connected
   correctly**, each pointing at the right board. So the pipeline was
   built and connected correctly from the start — this was a real dead
   end to rule out, not wasted effort, since the alternative (a
   never-connected feed) would have meant nothing on Pinterest would
   ever have worked, which didn't match the fact that boards did have
   pins from the initial connection.

### Conclusion: not a bug, just Pinterest's polling
Everything on our side (site, deploy, feed files, Pinterest's own
account-level connection) checks out correct. Pinterest's own docs say
new pins from an RSS feed appear "within 24 hours," but in practice
these feeds haven't picked up anything new in several days despite
multiple content changes in that window. Tried clicking "Edit" on the
Saving Money feed entry (without changing the URL) to see if re-saving
forces an immediate re-check — outcome not yet confirmed as of this
entry.

### Open items
- Confirm whether the "Edit and re-save" nudge actually triggered a
  re-poll on the Saving Money board specifically (test case: 2 new pins
  should appear that weren't there before). If it works, repeat for the
  other 6 feeds.
- If even that doesn't work within another 24 hours, worth contacting
  Pinterest support directly rather than continuing to self-diagnose —
  everything on the site/config side is confirmed correct at this
  point, so any further delay is unambiguously on Pinterest's end.
- Worth revisiting later whether this pipeline should treat "pins show
  up on Pinterest" as unreliable/slow by default (multi-day, not
  same-day) rather than assuming the docs' 24-hour figure, when setting
  future expectations.

---

## 2026-08-22 — Daily post: how to save money on a low income

Published from the queue via Claude chat (manually-provided GitHub PAT,
same pattern as prior sessions). Next pending item in
`content-pipeline/keyword-queue.json` in order was "how to save money on
a low income" (saving pillar) — written, verified with a full local
`npm run build` (no errors, internal links resolve), opened as **PR #19**
(`post/how-to-save-money-on-a-low-income` branch), `pinApproved` left
`false` pending pin review. Queue entry marked `published`.

Structured around one core argument rather than a generic tips list: a
comparison table of expense categories by typical monthly impact vs.
effort to change (housing/transport vs. subscriptions/fees), making the
case that small discretionary cuts get disproportionate attention
relative to their actual dollar impact. Also included a staged worked
example ($2,400/mo take-home, three changes over ~2 months) and a section
on the federal Saver's Credit (2026 income limits: $80,500 MFJ / $60,375
HoH / $40,250 single, sourced from the IRS) — a concrete, often-missed
lever specific to this income range, not generic advice repeated from
other posts. Added a "who this is for / not for" section that explicitly
routes acute-crisis situations (missed rent, shutoff notices) to 211.org
and local assistance programs rather than treating this as a savings-
strategy problem — kept in scope, not just a disclaimer.
`pinVisual: "table"` used (the table renderer added in PR #18) — first
post to use it since that renderer shipped.

### Open items
- PR #19 not yet merged.
- PR #18 (pin variety + content-depth treatment on 2 posts) still not
  merged either — carried over.
- Content-depth treatment still only applied to a handful of posts, not
  the full catalog — carried over.
- 5 topics still pending in the queue (what hurts your credit score,
  credit utilization explained, how to start investing with little
  money, compound interest explained simply, best free investing apps
  compared).
- Item 3 from the 08-20 feedback (content-direction reframing) still not
  discussed — carried over.
- Reverse cross-link from 50/30/20 → zero-based-budgeting still not
  added — carried over.
- Pillar pages in GSC still not checked/submitted — carried over.

---

## 2026-08-21 (cont. 2) — Pin visual variety + content-depth treatment (PR #18)

Second action on the 2026-08-20 external feedback batch — item 1 (depth)
plus a separate pin-variety fix requested in the same conversation
(budgeting-pillar pins all sharing the same pie-chart icon and looking
too similar to each other).

**Pin variety:** added a `pinVisual` schema field (`icon` default /
`equation` / `flow` / `table` / `plain`) and extended
`scripts/generate-pin.mjs` with flow-chain and small-table renderers to
go with the existing equation display. Applied deliberately sparingly,
not to every post: zero-based-budgeting-explained now shows its equation
instead of the pie chart, envelope-budgeting-method shows a 4-step flow
chain, 50-30-20-budget-rule-explained shows a small Needs/Wants/Savings
table, and high-yield-savings-accounts-explained is now a plain
title-forward pin. All other posts unchanged, still on their pillar's
default icon. Also added table/blockquote CSS to BaseLayout.astro so
plain markdown tables and blockquotes render cleanly in post bodies
without needing raw HTML in the `.md` files.

**Content depth:** retrofitted the two posts most directly named in the
08-20 feedback (not a full-site rollout yet):
- `zero-based-budgeting-explained` — added the exact example the
  feedback suggested: full sample budgets at $2,000/mo, $4,000/mo, and
  a variable-income example (as tables), a highlighted equation
  blockquote, a common-mistakes section, and a last-updated note.
- `managing-money-as-a-digital-nomad` — the specific "one-minute read"
  the feedback flagged as too brief. Added the home-bank vs.
  multi-currency vs. local-bank comparison table the feedback asked
  for, a worked currency-conversion cost example, a who-this-is-
  for/not-for section, and primary-source links (CFPB on currency
  conversion fees, IRS Publication 519 on the Substantial Presence
  Test) rather than the previous unsourced version.

Verified with a full local `npm run build` (clean) and regenerated all
11 pins — confirmed the seeded pin generation is still deterministic
for the 7 posts not touched by this change (only the 4 targeted pins
actually changed).

### Open items
- PR #18 not yet merged.
- Depth treatment has only been applied to 2 posts so far — the rest of
  the catalog (8 other published posts) hasn't been touched. Worth
  deciding whether/how far to roll this out, and to which posts.
- Item 3 from the 08-20 feedback (content-direction reframing toward
  irregular-income / cross-border / financial-systems-sequence /
  tool-led-guides angles) still not discussed.
- 6 topics still pending in the queue (unchanged from prior entries).
- Reverse cross-link from 50/30/20 → zero-based-budgeting still not
  added (carried over from 08-19).
- Pillar pages in GSC still not checked/submitted (carried over from
  08-19 SEO session).

---

## 2026-08-21 (cont.) — Editorial policy + corrections policy pages (PR #17)

First concrete action on the 2026-08-20 external feedback batch (item 2,
trust/E-E-A-T signals). Added two new pages, linked from the footer nav:

- `/editorial-policy` — how content is produced/sourced, when a
  "Reviewed by" credit applies (only when someone qualified has actually
  reviewed the piece — not a blanket label, and most posts don't have one
  today), when "last updated" notes apply, and what we don't do
  (paid placement, affiliate-driven rankings).
- `/corrections-policy` — how factual errors get fixed vs. how stale
  rates/figures (expected drift, not "errors") get handled vs. typos.

Deliberately did **not** add a standalone affiliate-disclosure page:
there are no live affiliate links on the site, and the existing
`/about` page explicitly states the site doesn't do affiliate-driven
"best X" rankings. A disclosure page today would be disclosing something
that doesn't exist — flagged this instead of building it, holding off
until an actual affiliate relationship goes live. Contact was already
covered by the existing `/contact` page — no changes needed there.

Also decided (not yet executed): hold off on adding "Reviewed by" tags
to any post until there's an actual qualified reviewer in the loop —
adding the tag now would immediately contradict the policy this PR just
wrote.

### Open items
- PR #17 not yet merged.
- Still to discuss/decide: item 1 (depth) rollout to older posts beyond
  the one it was trialed on (high-yield-savings-accounts-explained), and
  item 3 (content-direction reframing toward irregular-income /
  cross-border / financial-systems-sequence / tool-led-guides angles).
- If/when an affiliate relationship goes live, revisit both the
  About page's current "we don't do affiliate rankings" language and
  add the affiliate-disclosure page at that point.
- 6 topics still pending in the queue (unchanged from prior entry).
- Reverse cross-link from 50/30/20 → zero-based-budgeting still not
  added (carried over from 08-19).
- Pillar pages in GSC still not checked/submitted (carried over from
  08-19 SEO session).

---

## 2026-08-21 — Daily post: high-yield savings accounts explained

Published today's post from the queue. PR #15 (envelope budgeting) merged
since the last entry, with its pin auto-generated. Next pending item in
`content-pipeline/keyword-queue.json` in order was "best high yield
savings accounts explained" (saving pillar) — written, verified with a
full local `npm run build` (no errors), opened as **PR #16**
(`post/high-yield-savings-accounts-explained` branch), `pinApproved` left
`false` pending pin review. Queue entry marked `published`.

Used this post to try out a few items from the 2026-08-20 external
feedback where they fit the topic naturally: a comparison table of what
actually separates one HYSA from another (APY, rate conditions, minimum
balance, fees, access speed, insurance type), a worked numeric example
($10k at checking vs. national-average vs. HYSA rates), a "who this is
for / not for" section, and a common-mistakes section. Deliberately did
**not** name a specific "best" bank or quote a single rate as fact —
researched current rate reporting (NerdWallet, Kiplinger, Experian,
Fortune, Yahoo Finance, US News, CNBC, Bask Bank's own rate page all
current as of mid-August 2026) to ground the *range* described
(Fed target 3.50–3.75%, top HYSAs roughly 4%+ vs. FDIC national average
~0.4%), but treated any single number as a snapshot that will go stale,
consistent with how how-much-emergency-fund.md already handled this same
problem. Linked to FDIC deposit-insurance and Federal Reserve monetary
policy pages as primary sources rather than a bank's marketing page.

### Open items
- PR #16 not yet merged — waiting on review/CI.
- Still haven't decided which other items from the 08-20 feedback batch
  (Reviewed-by, editorial/corrections/affiliate-disclosure pages, the
  3-pillar content-direction reframing) to act on — this session only
  applied the "more depth" piece, and only where it fit one post.
- 6 topics still pending in the queue (how to save money on a low
  income, what hurts your credit score, credit utilization explained,
  how to start investing with little money, compound interest explained
  simply, best free investing apps compared).
- Reverse cross-link from 50/30/20 → zero-based-budgeting still not
  added (carried over from 08-19).
- Pillar pages in GSC still not checked/submitted (carried over from
  08-19 SEO session).

---

## 2026-08-20 (cont.) — External feedback to discuss (not yet acted on)

Feedback below came secondhand (a friend of a friend). Logging verbatim
for a future session — nothing implemented yet.

### 1. Articles need more depth
The fetched digital-nomad guide is listed as a one-minute read. Useful,
but too brief to compete consistently on high-value financial searches
where established publishers provide examples, tables, sources,
country-specific caveats, and decision support. For each important
guide, aim for:
- A clear answer in the first 2–3 sentences
- A realistic worked example with numbers
- A "who this is for / not for" section
- Specific trade-offs and common mistakes
- Links to primary sources where a claim depends on laws, rates, tax
  rules, fees, or product terms
- A practical next step or downloadable/template-like tool

Example given: in the zero-based budgeting guide, include a full sample
monthly budget at $2,000, $4,000, and variable-income levels — not only
a definition. For the digital-nomad article, add a comparison table for
home bank vs. multi-currency account vs. local bank, with clearly dated
fee/product details and source links.

### 2. Trust/E-E-A-T signals
- Add "Reviewed by" only when a qualified reviewer has actually
  reviewed it.
- Add "Last updated" dates and explain what was updated when changes
  are material.
- Cite official sources — government consumer agencies, central banks,
  regulators, tax authorities, fund prospectuses, and app pricing/terms
  pages.
- Add an editorial policy, corrections policy, affiliate disclosure,
  and contact method.
- Avoid generic AI-style volume. Google's stated direction: AI use
  itself is not the deciding factor; original, helpful, high-quality
  content with demonstrable E-E-A-T is.

### 3. Content direction
Rather than trying to cover every finance subject, make the site known
for a few unusually practical angles:
- Budgeting for irregular income: freelancers, creators, commission
  earners, and gig workers.
- Money across borders: remote workers, digital nomads, multi-currency
  budgeting, transfer fees, and tax-residency checklists.
- Beginner financial systems: a sequence from first budget → emergency
  fund → debt/credit → investing basics.
- Tool-led guides: calculators, checklists, budget templates,
  bank/app comparison frameworks.

### Open items
- Discuss and decide which of the above to act on — none implemented
  yet. Worth weighing against the existing "reviewed by" / editorial
  policy pages already noted as open in earlier entries.

---

## 2026-08-20 — Daily post: envelope budgeting method

Published today's post from the queue (session done via Claude chat with a
manually-provided GitHub PAT, same as the 08-19 SEO session). Next pending
item in `content-pipeline/keyword-queue.json` in order was "envelope
budgeting method" (budgeting pillar) — written, verified with a full local
`npm run build` (no errors, internal links resolve), opened as **PR #15**
(`post/envelope-budgeting-method` branch), `pinApproved` left `false`
pending pin review, matching the existing convention. Queue entry marked
`published`.

Deliberately used a cash-vs-digital comparison structure with an explicit
recommendation (digital as the practical default, cash for one specific
overspending pattern) rather than the numbered-steps format used by the
last two budgeting posts — per the standing "vary structure, keep a point
of view" editorial guidance. Cross-links to zero-based-budgeting-explained,
50-30-20-budget-rule-explained, and how-to-make-a-budget-for-beginners.

### Open items
- PR #15 not yet merged — waiting on review/CI.
- 5 topics still pending in the queue (best high yield savings accounts,
  how to save money on a low income, what hurts your credit score, credit
  utilization explained, how to start investing with little money, best
  free investing apps compared).
- Reverse cross-link from 50/30/20 → zero-based-budgeting still not added
  (carried over from 08-19).
- Pillar pages in GSC still not checked/submitted (carried over from
  08-19 SEO session).

---

## 2026-08-19 (latest, cont. 11) — SEO/indexing session with Claude (chat) + backlink strategy research

### Context
This entry covers a full session done via Claude chat (not Claude Code in-repo)
using a manually-provided GitHub PAT for repo read/write access. Starting point:
a note saying moneymattersdaily.money wasn't showing in Google search results
(moneymatterdaily.com, a similarly-named unrelated/low-quality site, was
showing instead).

### Search Console findings — mostly already resolved, small real bug found
Checked GSC directly (screenshots from the user, who has an existing verified
domain property already set up — not done in this session):
- Sitemap: submitted 2026-08-18, status Success, 13 pages discovered. Already
  fine, no action needed.
- Homepage: confirmed "URL is on Google" / indexed.
- Individual post URLs: mixed — some already indexed on their own
  (`managing-money-as-a-digital-nomad` for example), others showed "URL is not
  on Google" and were manually submitted via Request Indexing
  (`how-to-make-a-budget-for-beginners`, plus the user worked through most of
  the rest of the post list, about/contact/disclaimer pages, until hitting the
  ~10-12/day manual submission quota — pillar pages not yet checked, carry
  over to next session).

### Real bug found and fixed: canonical/sitemap trailing-slash mismatch (PR #13, merged)
Inspecting `how-to-make-a-budget-for-beginners` (no trailing slash) in GSC
showed "No referring sitemaps detected" even though the sitemap was confirmed
successful. Root cause: `scripts/generate-sitemap.mjs` always emits URLs with
a trailing slash (walks `dist/` for `index.html`, matching the directory-style
static build output), but `BaseLayout.astro`'s canonical/OG tags were built
from `Astro.url.pathname` — whatever format a page happened to be requested
with — so canonical tags didn't consistently match the sitemap's URLs.

Fix, PR #13 (`fix-trailing-slash-canonical` branch, now merged to `main` and
deployed):
1. `astro.config.mjs` — added `trailingSlash: 'always'`, forcing canonical/
   OG/Twitter URLs to always include the trailing slash, matching the
   sitemap.
2. Follow-up caught while verifying #1 with a real `npm run build`: every
   hardcoded internal `<a href>` (nav + footer in `BaseLayout.astro`, the
   about/contact/disclaimer pages, the pillar/post loop templates in
   `[pillar].astro`/`[slug].astro`/`index.astro`) and two manual cross-links
   inside blog post markdown itself (`how-much-emergency-fund.md`,
   `zero-based-budgeting-explained.md`) were still missing trailing slashes.
   Left alone, every link on the site would've pointed at a URL that didn't
   match its own destination page's canonical tag — same inconsistency,
   just moved from "sitemap vs. canonical" to "internal links vs.
   canonical." Fixed all of them.
3. Verified: full local build (20 pages, no errors) + a script checking
   every `href="/..."` in the built HTML against actual built page paths —
   zero broken/mismatched links before pushing.

Net effect going forward: Google's regular crawler should now discover new/
updated pages via consistent sitemap↔canonical↔internal-link signals,
without needing manual Request Indexing on every single new post.

### Confirmed: no comment system exists — intentional, not an oversight
Checked the full source tree for any comment functionality (none found).
This matches the README's stated "plain and credible," no-lead-gen,
no-engagement-funnel design intent for a YMYL finance site — not a missing
feature. If ever revisited, a static-site-compatible option like Giscus
(GitHub-Discussions-backed, no server) would be the cheapest fit — not
pursued this session.

### Backlink strategy — researched, mostly steered away from riskier tactics
Explored what's realistic for link-building at this stage:
- **Rejected as unreliable/risky**: bulk "300+ guest post site" listicles
  (identified as classic link-farm directories — templated boilerplate
  copy repeated verbatim across unrelated domains is the tell; Google's
  Sept 2025 update specifically targeted these networks in YMYL niches).
  Also checked Wise Bread specifically as a named example — its real
  "guest post" page turned out to be invite-only/writer-recruitment
  (unpublished samples required, sent to a hiring email), not an open
  backlink exchange.
- **Rejected as unrealistic for a new site**: "best personal finance
  blogs" roundup lists — these are editorially curated by each site's own
  staff about already-established blogs (Wise Bread, Mr. Money Mustache,
  Financial Samurai, etc.), not open-submission lists a new/unknown site
  could get added to.
- **Identified as the realistic path**: journalist source-request
  platforms (post-HARO landscape) — Source of Sources (free, HARO's
  original founder's replacement), Qwoted (free tier), Featured (revived
  HARO brand, free daily digest), #JournoRequest on X/Bluesky. You answer
  a real journalist's question with a specific, quotable, ready-to-use
  answer; if used, you get a byline + real editorial backlink regardless
  of how new/small your site is. Lower effort per attempt than guest
  posting, no bad-neighborhood risk, doesn't require existing authority.
  **Not yet signed up for or used** — next step if pursued.
- **Resource-page outreach**: two email templates drafted (a "add my
  guide to your resource list" pitch and a guest-post pitch) — kept as
  optional/secondary, lower expected hit rate than the journalist-query
  route. Not sent to anyone yet; no real target list built (would need
  real resource/roundup pages to still be found, not done this session).

### Open items
- Pillar pages (`/budgeting`, `/saving`, `/credit`, `/investing-basics`,
  `/app-comparisons`) not yet checked/submitted in GSC — quota was hit
  before reaching these. Resume next session (quota resets daily).
- Backlink outreach: no actual sending done this session — research and
  strategy only. Journalist-platform signup/usage not started.
- Envelope budgeting (next item in `content-pipeline/keyword-queue.json`)
  and the other 5 pending queue topics still not written.

---

## 2026-08-19 (latest, cont. 10) — Top-of-file banner + daily post reminder automation

### Banner added
Added a "read this first" banner at the very top of this file after
today's read-order mistake (see "cont. 9" below) — points anyone
opening this file straight at the current section and warns that the
bottom is the oldest entry, not the latest.

### Daily post reminder — chose reminder-only, not full auto-generation
Two options considered for "at least one post a day":
1. **Reminder only** (built): `.github/workflows/daily-post-reminder.yml`
   runs daily at 14:00 UTC, checks git history for a post added to
   `src/content/blog/` that day; if none, opens a GitHub issue
   (`content-reminder` label) naming the next `"pending"` keyword from
   `content-pipeline/keyword-queue.json`. Companion workflow
   `close-post-reminder.yml` auto-closes that issue once a post
   actually lands on `main`. No content is generated or committed by
   either workflow — reminder/tracking only.
2. **Full auto-generation** (not built): an LLM writes the whole post
   and opens a PR unattended. Skipped on purpose — this project
   already has a logged entry about the site "feeling AI-generated"
   where the fix was editorial (specificity, varied structure, an
   actual point of view), not a tooling fix, and X posting was kept
   manual for the same review-quality reason. Revisit only if there's
   a real editorial-review step in front of anything auto-generated.



Confirmed via GitHub Pages settings screenshot: DNS check successful,
custom domain `moneymattersdaily.money` set, **Enforce HTTPS checked
and active**, site live at https://moneymattersdaily.money/. No action
needed here — this was already effectively done, just not visually
confirmed until now.

Also correcting a mistake from earlier today: a status check of this
file read from the bottom (oldest entries, 2026-08-17) instead of the
top (newest), so posts/images/social-links/hello@ were reported as
still-open when they'd already been resolved days ago in later
entries. No duplicate NOTES files exist — just the one, newest-first.
The stale historical "Open items" block near the bottom of the file
was reverted to its original wording as an accurate record of what
was open *at that point in time*; only entries dated 2026-08-19 or
later reflect current status.

## 2026-08-19 (latest, cont. 8) — Pin equation field + X algorithm research (link/image placement)

### Pinterest pin: optional equation field
Added a reusable `equation` frontmatter field (`src/content.config.ts`) so
any post can show a short formula on its pin, rendered in a bordered box
in the gap between the pillar icon and title (`generate-pin.mjs`). Used
it on the zero-based-budgeting post: "Income − Expenses = $0". Confirmed
optional/non-breaking by regenerating a post without the field
(how-much-emergency-fund) and diffing the output — identical to before.
Pushed onto the still-open PR #11 branch, not merged yet.

### X posting format changed: link moved out of the main post
Researched current X algorithm behavior before answering a question about
whether the drafted posts needed images. Two findings, both acted on:

1. **Images**: worth attaching — posts with native images get roughly a
   15–25% reach lift over text-only. The existing Pinterest pin PNGs
   double as this; no new asset needed.
2. **Links**: since ~Q1 2026, X's algorithm suppresses reach by
   30–50%+ (multiple independent sources; some report "near-zero"
   engagement) for non-Premium accounts when a link sits in the main
   post body — X wants to keep users on-platform. The account isn't on
   Premium, so this applies in full. Workaround used industry-wide:
   post the text alone (with image attached), then reply to your own
   post with just the link, in a separate reply.
Separately confirmed: the site domain printed as text on the pin images
themselves is **not** treated as a link by the algorithm — no evidence
X OCR-scans images for URLs — so that's unaffected and actually helps
attribution survive reposts/screenshots even without a clickable link.

`scripts/generate-x-drafts.mjs` rewritten to output this format
directly: a link-free main post + a separate "first reply" block with
just the URL, for every draft. Regenerated all 9 existing drafts via
`--all` in the new format. Pushed to the PR #11 branch.

### Open items
- **Correction**: PR #11 was already merged (`adde76e`) — not still
  open as logged below. What's actually pending is a *new*, separate
  commit pushed to the same branch name
  (`post/zero-based-budgeting-explained`) after that merge — the X
  draft format rewrite (link-in-reply, main post + pin image). That
  needs its own PR opened and merged, it's not a continuation of #11.
- X drafts still require manually attaching the pin image and manually
  posting the reply — no automation, by design (see earlier entries on
  why X API automation is on hold).

## 2026-08-19 (latest, cont. 7) — Started publishing from the content queue: one post per day

Found the existing article backlog at `content-pipeline/keyword-queue.json`
(10 pending topics across 5 pillars, 5 already published). Deliberately
publishing one at a time rather than batching — the "Daily" in the site
name is meant literally, so a daily publish cadence matches the brand
better than dumping several posts at once.

**First post published from the queue:** "Zero-Based Budgeting Explained"
(budgeting pillar) — chosen as the next item in queue order, and because
it pairs naturally with the already-live 50/30/20 post (cross-linked both
directions... actually only linked from the new post to the existing one,
worth adding the reverse link on the 50/30/20 post in a future pass).
Opened as **PR #11** rather than pushed straight to `main`, matching the
existing review pattern (`pin-preview.yml` / `x-draft.yml` workflows run
on blog-post PRs; `pinApproved` left `false` pending human review of the
generated pin, same convention as all other existing posts). Verified
locally with a full `npm run build` before pushing — page compiles,
internal links resolve, Pinterest pin renders correctly with the new key
mark from the previous entry.
`content-pipeline/keyword-queue.json` updated to mark this keyword
published.

### Open items
- PR #11 not yet merged — waiting on review/CI.
- 9 topics still pending in the queue. Cadence going forward: one per
  day, picking the next in queue order unless told otherwise.
- Still open: add a reverse cross-link from the 50/30/20 post to this
  new zero-based-budgeting post.

## 2026-08-19 (latest, cont. 6) — Key mark added to Pinterest pins + built X header banner

### Clarified profile-picture file choice
Both Pinterest and X flatten transparent PNGs onto their own default
backing rather than adapting live like `favicon.svg`'s dark-mode CSS
swap does (that only works because it's a live SVG; a static PNG
can't respond to page theme). So: use
`docs/logo/profile-pic-teal-bg-400.png` (solid teal circle) for both
platforms' profile picture upload, not the transparent version. The
transparent PNG is still useful for watermarking/overlay use, just
not as the direct profile picture.

### Pinterest pin template (`scripts/generate-pin.mjs`) — added the mark
Checked the actual pin-generation code before assuming anything was
"decorative and unrelated" — correction to how this was described
earlier in conversation: the big circular graphic on each pin (pie
chart on budgeting pins, piggy bank on saving, etc.) is each pillar's
own dedicated large-format icon, a deliberate separate icon set for
pin art, not a stray unrelated graphic. Left that as-is.
What was actually missing: the wordmark ("MONEY MATTERS DAILY") had
no brand mark next to it anywhere in the template. Added a
`keyMark()` helper — same key shape/proportions as the header and
favicon — placed above the wordmark, offwhite stroke (dark teal won't
show against the pin's dark teal background, unlike the favicon which
can rely on a CSS dark-mode swap that doesn't exist on a rendered
PNG). Regenerated all 8 existing pins via `node scripts/generate-pin.mjs
--all` so they carry it now; verified against both a 4-line title and a
longer pillar label (Travel & Nomad Finances) for overlap before
committing. Future posts get the mark automatically since it's in the
template, not hand-added per image.

### Built the X header banner
`docs/logo/x-banner-1500x500.png` — key mark, wordmark, and a small
pillar tagline, teal gradient background matching the pin template's
palette. Checked the layout stays clear of the bottom-left zone where
X's UI overlaps the circular profile picture on top of the banner.
No equivalent was needed for Pinterest — it has no profile banner,
only per-board cover thumbnails (which pull from pin images, not a
logo placement).

### Open items
- Files ready but not yet uploaded anywhere: profile pictures (both
  variants), the X banner. All manual upload steps.
- Only `favicon.svg` has the dark-mode CSS swap; every other
  placement (pins, banner) is a static export with a color choice
  baked in at generation time — correct as long as each background is
  fixed (dark teal in both current cases), but worth remembering if a
  future placement needs a light background.

## 2026-08-19 (latest, cont. 5) — Logo decision finalized: key mark, wired in for real

### Abandoned the leaf entirely
After the outline-redraw draft (previous entry), explored non-leaf
directions instead of continuing to patch the leaf's generic-template
problem. Rejected in order: growth/circle, bar-chart, and sparkline
concepts (too close to a trading/investing-app look, which isn't the
site's intent); "M" monogram (two rounds of attempts didn't resolve
into a readable letterform); simplified single-leaf silhouettes
(flagged as reading unintentionally suggestive once reduced to a plain
curved almond shape — this is why the leaf direction was dropped
altogether, not just the fill style); book/bookmark and overlapping-
circles concepts (all rejected, no specific reason given). **Landed
on a key mark** — round bow, single shaft, two teeth, small center
hole — stroke-only, same construction as `PillarIcon.astro`
(hollow, `currentColor`-style teal stroke). Chosen for reading clearly
as a distinct object with no ambiguity, and being uncommon in
finance-blog branding specifically (vs. leaf/shield/chart, which are
saturated).
Iterated shaft orientation (diagonal "skeleton key" vs. upright) —
picked upright for its tighter, more square bounding box, which
crops better into a circle (profile pictures) and favicons.
Checked legibility at true 16px/32px favicon size: 32px is fully
crisp; 16px is recognizable but the two teeth notches soften toward
one shape at that size. Decided this was an acceptable tradeoff — a
single-size file is used everywhere rather than maintaining a separate
simplified favicon-only variant, matching the "keep it simple unless
proven necessary" call made here rather than the earlier
detailed/simplified split done for the leaf mark.

### Shipped — replaces the leaf work, live on the actual site now
Unlike the leaf mark (which only ever lived as unused files in
`docs/logo/`), the key mark is now wired into the real site:
- **`public/favicon.svg`** — replaced the old, unrelated mountain/
  torch shape with the key mark. Kept the existing
  `prefers-color-scheme: dark` swap pattern (teal → white in dark
  mode).
- **`public/favicon.ico`** — regenerated as a real multi-resolution
  icon (16/32/48px embedded) from the new mark. Replaces the old
  orphaned file, which was a single 32px PNG mislabeled `.ico`, in an
  unrelated black/magenta color scheme, and wasn't referenced by any
  code (browsers may still auto-request it by convention, so it
  wasn't fully inert despite being dead code).
- **JSON-LD `Organization.logo`** (`BaseLayout.astro` line 37) —
  updates automatically, no code change needed; it already pointed at
  `/favicon.svg` by path.
- **Site header** (`BaseLayout.astro`) — was text-only
  (`{siteName}`, no image). Added the mark at 30px next to the
  wordmark; tested 24px first, felt like a stray bullet next to the
  bold wordmark rather than a mark, sized up. Verified via an actual
  `npm run build` + screenshot of the built output, not just an
  isolated mockup.
- **`docs/logo/mark-key.svg`** — standalone source file, inline
  color attributes (not the `<style>`-tag approach used in
  `favicon.svg`, since third-party upload targets like Pinterest/X
  may strip `<style>` tags).
- **`docs/logo/profile-pic-transparent-400.png`** and
  **`profile-pic-teal-bg-400.png`** — ready-to-upload 400×400
  Pinterest/X profile picture exports; transparent-background and
  solid-teal-circle-background variants, confirmed alpha channel
  present on the transparent one.

### Open items
- Profile pictures not yet actually uploaded to Pinterest/X — files
  are ready in `docs/logo/`, upload is a manual step.
- All the recolored/simplified **leaf** mark files from the previous
  two entries (`full-lockup-teal.png`, `mark-detailed-teal.png`,
  `mark-simplified.svg`, etc.) are now superseded and unused — left in
  place in `docs/logo/` for reference/history, not deleted.
- 16px favicon softness (teeth notches blurring) accepted as a known,
  minor tradeoff — not revisited unless it becomes a real complaint.

## 2026-08-19 (latest, cont. 4) — Logo: outline redraw attempt, plus found 3 disconnected identities on the live site

### Redraw direction changed: leaf shape kept, fill style dropped
Followed up on the pillar-icon style-mismatch flag from the previous
entry. First explored moving off the leaf shape entirely (growth/circle,
bar-chart, sparkline, "M" monogram concepts) to solve the AI-template
concern at the same time — rejected: chart/trendline shapes read as
"trading app" (not the site's intent), the monogram sketches didn't
resolve into a clear "M," and simplified single-leaf silhouettes were
flagged as reading unintentionally suggestive once simplified down to
a plain curved almond shape. Decision: keep the leaf concept (the
three-leaflet sprig from the existing detailed mark), but redraw it as
a stroke-only outline to match `PillarIcon.astro`'s construction
(hollow, `currentColor` stroke, ~1.6 weight equivalent), rather than
solid fill. Traded off knowingly: this fixes the stroke-vs-fill
mismatch but does **not** resolve the generic-leaf-logo-template
concern — accepted as a deliberate tradeoff, not a fix.
Status: draft outline traced by hand (no vector source file exists for
the original detailed mark, only the PNGs in `docs/logo/` — traced
from those, not pixel-exact). Not yet finalized or saved to the repo.

### Found: the live site currently has 3 disconnected logo identities
Checked what's actually wired into `src/layouts/BaseLayout.astro`
before going further, since none of the `docs/logo/` work (recolor,
simplified mark, this outline draft) was connected to anything live:

1. **`public/favicon.svg`** — the real browser tab icon (line 73) and
   the JSON-LD `Organization.logo` field crawlers read (line 37). An
   abstract mountain/torch shape, black line art on transparent
   (white in dark mode via `prefers-color-scheme`). Unrelated to the
   leaf mark.
2. **`public/favicon.ico`** — same mountain/torch silhouette as the
   SVG, but a completely different export: single 32×32 PNG
   relabeled `.ico` (not a real multi-res icon file), white shape on
   a black rounded-square background with a magenta/pink accent —
   a color not used anywhere else in the site's teal palette. **Not
   referenced anywhere in `BaseLayout.astro`** — dead/orphaned file,
   though browsers may still auto-request `/favicon.ico` by
   convention despite the explicit `<link rel="icon">` override.
3. **Site header** — plain text (`{siteName}`), no logo image at all
   (line 81).
Also clarified: `og:image`/`twitter:image` (lines 66/71) is an
unrelated, separate pipeline — a per-page optional prop for share
preview images (e.g. a post's Pinterest pin), not a logo slot. Most
pages currently pass nothing and show no social preview image. Don't
conflate fixing the logo with fixing this.

Net effect: the leaf mark (any version, including all the recolor/
simplify work) exists only as files in `docs/logo/` — it isn't the
favicon, isn't the JSON-LD logo, isn't in the header. Stranded until
deliberately wired in.

### Open items
- Outline leaf redraw: still a hand-traced draft, not finalized or
  committed.
- Once a final mark is chosen: needs to replace `favicon.svg`'s
  shape, update the JSON-LD `logo` URL, and a decision made on
  whether to add it to the header (currently text-only).
- `favicon.ico` orphan: delete, or regenerate a proper multi-res
  version matching the final mark — undecided.
- Generic-leaf-template concern from the previous entry remains
  open and accepted as a known tradeoff, not resolved.

## 2026-08-19 (latest, cont. 3) — Logo review: recolored to teal, simplified mark for small sizes

### Honest review of the drafted logo (leaf mark + serif wordmark)
What worked: serif caps wordmark reads editorial/trustworthy rather than
startup-generic, good instinct for finance; leaf mark is competently
drawn with good negative-space vein lines; two-line stack works as a
square avatar.

Flagged before shipping it everywhere:
- **Color mismatch** — original leaf green didn't match the site's
  actual accent teal (`#1c4a4a`)/mid-teal (`#5b8a8a`) at all; would
  clash between site chrome and logo if placed side by side.
- **Style clash with the existing pillar icon system** — the site's
  pillar icons (`PillarIcon.astro`) are deliberately thin-stroke,
  hand-drawn line icons; this logo is solid-fill/organic-curve, a
  different visual language. Still true after this pass — not fixed,
  a decision still pending (see open items).
- **Leaf-icon + serif-caps wordmark is a very common AI-logo-generator
  template** (Looka/Canva/ChatGPT-style output for "wellness/finance"
  briefs) — risks undercutting the "not AI-generated" effort already
  put into the hand-drawn pillar icons. Still an open call, not
  resolved by recoloring alone.
- **Fine detail (vein lines, thin stem) wouldn't survive small sizes**
  — addressed this pass, see below.

### Recolor: math-based pixel remap, not a filter
Original had 2 flat foreground colors on white
(`rgb(5,77,59)` dark text/outline, `rgb(143,189,79)` light leaf fill).
For each pixel, solved the actual alpha-blend ratio against those two
source colors (not an approximate hue shift), then re-composited using
the site's real palette — `#1c4a4a` for the dark/text color,
`#5b8a8a` for the light leaf color — onto a transparent background.
Preserves original anti-aliased edges with no fringing.

Files (`docs/logo/`):
- `full-lockup-teal.png` — full wordmark + tagline, recolored,
  transparent bg. For header/OG-image/large use.
- `mark-detailed-teal.png` — original fine-detail leaf only,
  recolored, transparent bg. Large-size use only (see below for why).
- Originals kept alongside (`full-lockup-original.png`,
  `mark-detailed-original.png`) for reference.

### Simplified mark for small sizes (profile picture use, not the browser favicon)
Confirmed the site's actual browser favicon (`public/favicon.svg`) is
a separate abstract "M" monogram, unrelated to this leaf logo — so
"small sizes" here means Pinterest/X profile-picture thumbnail scale,
not the favicon.

Hand-built `docs/logo/mark-simplified.svg` as an actual vector (not a
raster trace): dropped the tiny third leaflet from the original (it
vanishes below ~80px anyway), thickened the vein gaps, simplified
curves, and centered the composition so a circular crop (how
Pinterest/X actually display profile photos) doesn't clip the stem
the way the original's off-center trailing stem would have.
Rendered and checked at 400/128/64/32px plus a circular-crop mockup —
holds up clearly even at 32px. `mark-simplified-400.png` is the
ready-to-upload profile picture file.

### Open items
- **Not yet decided**: whether to (a) keep this logo as-is now that
  it's teal and has a small-size-safe mark, or (b) address the pillar-icon
  style mismatch / AI-template-pattern concerns with a redesign.
  Recoloring and simplifying didn't resolve either of those two flags
  — they're still open calls, not fixed.
- Logo files are committed to the repo (`docs/logo/`) but not yet wired
  into the actual site (header currently just shows text
  `MoneyMattersDaily`, no image) or uploaded as the live profile
  picture on Pinterest/X — still manual steps once the style question
  above is settled.

## 2026-08-19 (latest, cont. 2) — X posting: manual for now, drafting automated

### Decision: hold off on X posting automation
X killed its free API tier in Feb 2026 — now pay-per-use, prepaid with
a card. Roughly $0.015/post with no link, ~$0.20/post with a link
(posts driving traffic to the blog will have one). Not expensive at
current volume (~$1.60-4/month for 8-20 posts), but it's a new
recurring cost requiring card-on-file, unlike Pinterest's free posting
API. **Decided to post manually for now** and revisit X automation
once Pinterest's own posting automation (still just planned, not
built — see the 2026-08-17 entry) is actually running and there's a
proven cadence to match.

### Built instead: free draft-text generator (no API, no posting)
`scripts/generate-x-drafts.mjs` (`npm run x:drafts`) generates
copy-paste-ready X post text per blog post — title + description,
trimmed to fit X's 280-char limit with room reserved for the link.
Writes to `content-pipeline/x-drafts.md`. Idempotent: only adds drafts
for posts that don't have one yet; re-running never overwrites an
existing draft unless that post's slug is passed explicitly, so
hand-edited text survives. Same PR-trigger pattern as the pin-preview
workflow: `.github/workflows/x-draft.yml` runs on blog-post PRs and
commits the new draft(s) back onto the branch — text only, no API
calls, nothing auto-posted anywhere.

Also fixed an accidental duplicate `devDependencies` key in
`package.json` noticed while in there (harmless, but cleaned up).

## 2026-08-19 (latest, cont.) — X account created: @MoneyMattersDly

### Resolved: X signup, fully unblocked
The moderation fix worked — approving `info@x.com`'s pending message
got the verification code through immediately. Account created:
- Display name: `MoneyMattersDaily` (matches site branding capitalization)
- Handle: `@MoneyMattersDly` (X's 15-char limit forced a shortened
  handle — this happens to exactly match the placeholder
  `twitter.com/moneymattersdly` already sitting in the site footer, so
  **no code change needed there**; X handles are case-insensitive in
  URLs)
- Interests selected: Business & Finance, News, Technology (matches
  site content pillars — avoided Politics/Crypto/Memes/Gaming etc. to
  keep early algorithmic suggestions on-brand)
- Followed 1 required starter pack: Hedge Funds (closest fit to actual
  content vs. the CEO/startup/diplomat pack options)

### Profile setup (in progress)
Decided to mirror the Pinterest setup approach — reuse existing site
assets/voice rather than new stock content:
- Profile photo: site favicon (`public/favicon.svg`/`.ico`)
- Bio: matches homepage tagline tone (plain-language, no-jargon
  positioning)
- Website field set to `https://moneymattersdaily.money`
- Declined the "Get Verified" (paid Premium) prompt — same call as the
  ad-network timing decision, not worth it pre-traffic
- Left location blank (public-facing field here, unlike Pinterest's
  backend-only country setting — no reason to disclose Ethiopia
  publicly on the account)

## 2026-08-19 (latest) — Root cause found: X signup "silent block" was moderation, not X

### Resolves the open "X signup retried, same silent block" item
Checked `contact@`'s Conversations → Pending queue in Google Groups
(`groups.google.com/a/moneymattersdaily.money/g/contact/pending-messages`)
and found 3 held messages — all `info@x.com` verification-code emails
from earlier X signup attempts (3 separate codes, ~15min apart), never
approved into the inbox.

**Root cause**: the group is holding messages from first-time/unknown
external senders for moderation, even though the general "Who can post
→ External" access setting is Allowed. X's verification emails were
never actually blocked or lost — they were arriving and sitting
unseen in this queue the whole time. That's what looked like a
"silent block" on the X side across multiple retries; it was actually
this group waiting on manual approval that nobody was checking.

**Status**: the 3 held codes are stale (verification codes expire in
minutes, these are hours old) — not usable. Next step before retrying
X signup again: find and disable the moderation hold on first-time
external senders in Group settings, *then* retry so the next
verification email lands directly in the inbox instead of the pending
queue.

### Also verified as part of this pass
- Subscription/delivery setting for the sole member (Mikias A Nedha,
  `mike@teredatrades.com`) is **"Each email"** — no digest delay, this
  part was already correct.
- Access settings for the group (`contact@moneymattersdaily.money`):
  external senders are allowed to post; "Allow external members" = No
  only affects who can join as a member, unrelated to who can send.

## 2026-08-19 (later) — Contact address decision + group setup verification

### `hello@` → `contact@` decision (missed from the original email setup log)
Originally planned as `hello@moneymattersdaily.money` (see the 2026-08-17
Google Workspace email section below) — decided against that and went
with **`contact@moneymattersdaily.money`** instead, judged more
professional/standard for a finance site's public contact address.
Should have been logged at the time; recording it now since it wasn't.

### Contact group verified end-to-end
`contact@moneymattersdaily.money` is a Google Group (not a full mailbox),
custom access type. Confirmed in Admin Console:
- Sole member: Mikias A Nedha (`mike@teredatrades.com`), role Owner.
- Access settings: **External senders can post** (checkmark on
  "Who can post" → External) — mail from outside senders (contact-form
  visitors, customers) will actually reach the group, not bounce.
- "Allow external members" = No — this only controls who can *join* the
  group as a member, unrelated to who can *send* to it; doesn't affect
  the above.

### Open items
- Still to verify: the member's email delivery preference (digest vs.
  every email) and setting up "Send mail as" so replies go out from
  `contact@moneymattersdaily.money` instead of the personal address.

## 2026-08-19 — SEO/AI-crawlability review + fix (PR #10)

### Review, before adding any new articles
Checked robots.txt, sitemap, page markup, and structured data against
production (`https://moneymattersdaily.money`) to confirm what's actually
crawlable before writing more content on top of it.

- **robots.txt**: `User-agent: * / Allow: /`, sitemap declared — live
  matches repo exactly. No disallow rules, so AI crawlers (GPTBot,
  ClaudeBot, CCBot, PerplexityBot, etc.) are allowed same as search
  engines. No change needed.
- **Sitemap**: auto-generated post-build by walking real `dist/` output
  (`scripts/generate-sitemap.mjs`), so it can't drift from actual pages.
  No change needed.
- **Meta tags**: title, description, basic OG tags were present, but
  nothing else — no canonical tag, no `og:image`, no Twitter card meta,
  no structured data anywhere in the codebase.
- **No Search Console (or equivalent) connector available** in this
  environment — could verify crawlability/markup, not live
  indexing/impressions data.

### Fixed (PR #10, `seo-canonical-jsonld` branch)
- `BaseLayout.astro`: added `<link rel="canonical">` (derived from
  `Astro.site` + `Astro.url.pathname`, so it's automatically correct on
  every route), `og:url`, `og:site_name`, `og:image`/Twitter card meta
  (optional — falls back to a `summary` card when no image is passed),
  and site-wide `Organization` + `WebSite` JSON-LD rendered on every page.
- `blog/[slug].astro`: passes `og:type=article`, reuses each post's
  existing Pinterest pin (`/pins/<slug>.png`) as the OG/Twitter preview
  image (no new asset needed), and adds an `Article` JSON-LD block
  (headline, dates, author, publisher, `mainEntityOfPage`).
- Verified with a local `npm run build` — canonical tag, OG/Twitter meta,
  and both JSON-LD blocks confirmed in the built HTML on a post page and
  the homepage (homepage correctly has no Article block/og:image).
- Non-blog pages (about/contact/disclaimer/pillar pages/home) get the
  canonical tag and site-wide JSON-LD automatically with no per-page
  changes, since those props are optional on `BaseLayout`.

## 2026-08-18 (latest) — Pin icons/variation, budgeting post, all pillar feeds live

### Pin template: per-pillar icons + per-post variation
- All pins were rendering from the exact same template — only accent
  color and title text changed — so posts sharing a pillar looked
  like near-duplicates. Reworked `scripts/generate-pin.mjs`:
  - One original, hand-drawn line icon per pillar (pie chart /
    piggy bank / credit card / bar chart+arrow / phone checklist /
    globe+plane / megaphone) — not sourced from any icon set.
  - A seeded pseudo-random layer per post (icon rotation, horizontal
    drift, scale, scatter-dot placement) derived from the post slug.
    Same post always renders identically on re-run (stable git
    diffs); different posts in the same pillar now look distinct.
  - Regenerated all pins with `--all`, reviewed each pillar's icon
    visually before merging. PR #8.

### New budgeting-pillar post: written and approved
- Budgeting Tips board had a gap: the only budgeting post (50/30/20)
  was intentionally left `pinApproved: false` to avoid a duplicate
  pin on that board (it was already posted manually with a Canva
  image). Decided to write a second, unique budgeting post rather
  than re-approve the duplicate.
- Wrote `how-to-make-a-budget-for-beginners.md`, targeting the next
  queued keyword ("how to make a budget for beginners"). Marked
  `published` in `content-pipeline/keyword-queue.json`. PR #7.
- Approved its pin (`pinApproved: true`), regenerated with the new
  icon template, rebuilt to regenerate
  `public/pinterest-feed-budgeting.xml` — now has 1 item. PR #9.
- The 50/30/20 post stays unapproved on purpose — unchanged decision.

### Pinterest: all 7 pillar feeds now have live content
- Feed URLs (paste into each board's RSS connection to revalidate):
  - `https://moneymattersdaily.money/pinterest-feed-app-comparisons.xml`
  - `https://moneymattersdaily.money/pinterest-feed-budgeting.xml`
  - `https://moneymattersdaily.money/pinterest-feed-credit.xml`
  - `https://moneymattersdaily.money/pinterest-feed-investing-basics.xml`
  - `https://moneymattersdaily.money/pinterest-feed-news-trends.xml`
  - `https://moneymattersdaily.money/pinterest-feed-saving.xml`
  - `https://moneymattersdaily.money/pinterest-feed-travel-finance.xml`
- Budgeting Tips was the only board still showing "no items" going
  into this session; it now has content like the other six.

### Open item: footer social links never verified against real handles
- `pinterest.com/moneymattersdaily` and `twitter.com/moneymattersdly`
  in the footer were written as placeholder guesses before either
  account existed. Pinterest account is now real and claimed — the
  footer URL should be checked against the actual handle and
  corrected if it doesn't match. Twitter is parked (see below), so
  its footer link is a dead/unconfirmed link in the meantime — worth
  deciding whether to remove it or leave it as a placeholder.

## 2026-08-18 (still later) — X signup retried, same silent block

- Retried X/Twitter signup using `contact@moneymattersdaily.money`.
  Flow proceeded past the earlier app-download wall this time and
  showed the "enter the code we sent you" screen — but no email ever
  arrived. Confirmed via Gmail search: nothing from Twitter/X in
  Inbox or Spam, over a 7-day window.
- Ruled out a mail-delivery problem: Pinterest and Canva verification
  codes both arrived instantly and cleanly to the same address the
  same day, and a manual test send (teredatrades@gmail.com →
  contact@) delivered in seconds right after the second "Send again"
  attempt on X's side.
- Tried both mobile web and the native X app — same outcome on both,
  so it's not a web-vs-app difference. Reads as a fraud/anti-bot flag
  on the domain, device, or network rather than the entry point.
- **Decision: park X again**, unchanged from the earlier call.
  Nothing suggests more retries change the outcome right now. Revisit
  later once the domain has more sending/site history — Pinterest is
  live, claimed, and already the working channel in the meantime.

## 2026-08-18 (later) — DKIM completed; decided against MX activation wizard

### DKIM: done
- Cooldown passed, key generated successfully in Google Admin
  (Gmail → Authenticate email). Added the `google._domainkey` TXT
  record in Namecheap with the full `v=DKIM1; k=rsa; p=...` value.
  Status flipped to "Authenticating email with DKIM" immediately,
  and Domains → Manage domains → Email setup status now shows
  **DKIM: Complete** and **SPF: Complete**.

### MX: still shows "Pending activation" — decided to leave it
- The Email setup status page shows current MX values already match
  Google's recommended values exactly, but status stays "Pending
  activation" with an "Activate Gmail" link.
- Clicked through the wizard to see what it actually does. Turns out
  it's not a simple confirmation — the final step ("Add Gmail
  activation code") asks to **delete the existing 5 MX records**
  (aspmx.l.google.com x5) and **replace them with a single new record
  pointing to SMTP.GOOGLE.COM**. This is a real DNS change, not a
  rubber-stamp step, despite how the flow is framed.
- **Decision: don't make this change.** Mail is already working —
  `contact@moneymattersdaily.money` sends/receives, SPF and DKIM are
  both Complete. Swapping working MX records for an unfamiliar
  single-record format risks a mail outage (propagation gap, typo,
  TTL delay) for a badge that isn't blocking anything real. Nothing
  in the project depends on this badge clearing.
- If revisited later, do it in a low-stakes window with time to
  verify mail still works afterward — not as a follow-through on an
  in-progress wizard.
- Left the "Users" confirmation screen from the wizard without
  proceeding — closed the tab, no changes made to MX records.

## 2026-08-18 — Social media setup: Pinterest claimed, X paused

### Platform strategy — Pinterest over X/Reddit/LinkedIn
- X signup doesn't strictly require a phone number, but its anti-bot
  detection gated new signup behind an app-download requirement; hit
  that wall directly. Standard workarounds (incognito, different
  browser/network) aren't guaranteed since the gate is
  fingerprint/IP-based. **Paused on X** rather than force it.
- Pinterest fits the planned content (budgeting templates, "save $X
  in Y months" graphics, infographics) better — it's a visual search
  engine where pins keep driving traffic long after posting, unlike
  X's short shelf-life.
- Reddit needs slow organic trust-building in subs like
  r/personalfinance before any self-promotion (bans otherwise), so
  it's not a quick "set up and post" channel. LinkedIn fits a
  professional/B2B angle, not casual consumer budgeting content.
- No phone number required for Pinterest signup.

### Pinterest Business account setup
- Signed up at pinterest.com/business/create using
  contact@moneymattersdaily.money (not a personal Gmail).
- Business type: **Content creator**. Country/region: kept as
  **Ethiopia** (actual operating location, no registered entity).
  Checked whether Ethiopia blocks Pinterest ads access — it's not
  restricted/banned, just outside the short list of countries with
  self-serve Ads Manager (~US, UK, Canada, Australia, NZ, France,
  Ireland, Germany, Austria, Spain, Italy). Kenya and UAE were
  checked as alternatives and neither is on that list either (UAE
  requires a Pinterest-approved ad partner agency, same bucket as
  Ethiopia) — so country wasn't changed just to chase ads access.
  Ads can be revisited later via a partner agency once organic
  content is established.
- Business goals selected: drive traffic to the site, create content
  to grow an audience, grow brand awareness. Brand focus category:
  **Education** (no dedicated Finance option). Onboarding path:
  **Showcase your brand**.

### Website verification
- Confirmed the site was actually live first (visited the domain
  directly, checked DNS propagation on whatsmydns.net, confirmed A
  records + CNAME in Namecheap).
- Claimed the domain via DNS TXT record (chosen over HTML tag/file
  upload since it could be done entirely in Namecheap). Verified
  successfully on the first attempt.

### X/Twitter re-test — confirmed hard app-only block
- Re-tested the email-signup gate in a different browser using
  Tor-powered incognito mode, to rule out a browser/IP fingerprint
  cause. Same result — still redirected to "Get the app to finish
  signing up using email," with only a QR code / App Store / Google
  Play, and no email option on web.
  Screenshot: `docs/images/x-signup-app-only-block.png`.
- The "Or sign up using a different method" fallback on that screen
  only offers phone signup, not a way to keep using email on web.
- Conclusion: this isn't a fingerprint/IP heuristic that a different
  browser or network can dodge — X currently requires the mobile app
  to complete email signup, full stop. Don't re-try browser-based
  workarounds; if X is picked back up, either sign up with phone on
  web or install the app just for the one-time verification step.

### Current status
- Done: Pinterest Business account created, goals/category set,
  website claimed and verified.
- Not yet done: creating boards (Budgeting, Saving, Debt Payoff,
  etc.), designing infographics in Canva, first pins.
- Paused: X/Twitter setup, blocked on the app-download gate — may
  revisit or skip in favor of a Pinterest-first approach.

### Next steps
- Create 5–8 Pinterest boards matching site content pillars.
- Design first infographics in Canva (2:3 ratio, 1000×1500px) —
  start with a budgeting template pin and a "save $X in Y months"
  graphic.
- Begin pinning consistently (3–5/week target), each linking back to
  a corresponding post on the site.

### Board + first-pin plan (drafted, not yet created)
Boards to create, matching site pillars:
- Budgeting Tips, Saving Money, Building Credit, Investing Basics,
  Budgeting App Reviews.

First 5 pins (one per live post, real links only):
- 50/30/20 Budget Rule → Budgeting Tips board →
  `/blog/50-30-20-budget-rule-explained`
- How Much Should You Have in an Emergency Fund? → Saving Money
  board → `/blog/how-much-emergency-fund`
- How to Build Credit From Scratch → Building Credit board →
  `/blog/how-to-build-credit-from-scratch`
- Index Funds Explained for Beginners → Investing Basics board →
  `/blog/index-funds-explained-for-beginners`
- Best Budgeting Apps Compared (2026) → Budgeting App Reviews board →
  `/blog/best-budgeting-apps-compared`

### Pinterest posting automation — planned, not built
Idea: a GitHub Action that auto-posts new pins via the Pinterest API
(v5, `POST /v5/pins`) instead of manual upload each time.
- Requires: a Pinterest developer app (developers.pinterest.com) and
  an OAuth token with `pins:write` + `boards:read` scopes. Trial-tier
  access is enough since it only ever posts to our own account (no
  Pinterest app-review process needed for that).
- Token would live as a GitHub Actions secret on this repo.
- Real gap: pin images are still manually designed in Canva
  (deliberate — avoids the stock-photo/AI-templated look). Two
  options once boards/pins above are live:
  - **Semi-auto (do this first):** finish a pin image in Canva, drop
    it in the repo (e.g. `docs/pinterest-pins/`), Action picks it up
    and posts automatically with the right board/title/link.
  - **Full-auto:** Action also generates the image from the site's
    own `PillarIcon.astro` style — more setup, and risks drifting
    into the generic-template look the project actively avoids.
- Not started. Do the manual boards/pins above first before building
  this.

## 2026-08-18 — HTTPS fix, site polish, 3 new posts, contact email

### "Not secure" warning fix
- Site was showing "Not secure" in the browser despite `public/CNAME`,
  DNS, and the Actions deploy all being correct. Root cause: GitHub's
  `/pages` API showed no `https_certificate` field at all and
  `https_enforced: false` — SSL cert issuance had silently never
  triggered, even though DNS had verified.
- Fix: cleared the custom domain field in Settings → Pages, waited,
  re-entered `moneymattersdaily.money`. This forces GitHub to re-run
  its domain check, which kicked off Let's Encrypt cert issuance
  (confirmed via API: `https_certificate.state: "approved"`, valid to
  2026-11-16, covering both root and `www`). Then checked "Enforce
  HTTPS" once the checkbox became available. Resolved.

### "Looks unfinished" — site polish
Diagnosis: matched what NOTES already flagged as the main blocker —
thin content (2 posts), no visual hierarchy, 3 of 5 pillars completely
empty ("no posts yet"). Fixed in order of impact:

- **Post pages (`[slug].astro`)**: added a pillar tag, a byline ("By
  MoneyMattersDaily Editorial"), computed reading time, and a "Keep
  reading" related-posts section (same-pillar posts first, then
  others). Why: cheap trust/E-E-A-T signals, and related-posts gives
  readers/crawlers more internal links per page.
- **Homepage (`index.astro`)**: latest post now gets a hero/featured
  treatment (bordered card, pillar tag, bigger title, CTA) instead of
  being visually identical to older posts in a flat list. Why: a flat
  list of same-weight links was the biggest single reason the site
  read as a template rather than an edited publication.
- Fixed a whitespace bug in the byline where Astro was collapsing the
  space between the date and the reading-time separator — replaced
  implicit whitespace with an explicit `{' · '}` expression.

### Three new posts (filled the 3 empty pillars)
Credit, Investing Basics, and App Comparisons had zero posts — worse
for "feels unfinished" than any styling issue, since visiting those
nav items showed a bare "no posts in this pillar yet" message.
- `how-to-build-credit-from-scratch.md` (credit)
- `index-funds-explained-for-beginners.md` (investing-basics)
- `best-budgeting-apps-compared.md` (app-comparisons) — checked
  current app landscape/pricing via web search before writing, since
  Mint shut down in 2024 and app pricing changes; noted pricing is
  approximate and to verify before signing up, per the "don't guess,
  say so" standard from the earlier "feels AI-generated" discussion.
- Marked all three `published` in `content-pipeline/keyword-queue.json`.
- All 5 pillars now have at least one live post. Build verified clean
  (`npm run build`, 14 pages, no errors) before pushing to `main`.

### Contact email: `contact@` not `hello@`
- Decided on `contact@moneymattersdaily.money` over the originally
  planned `hello@` — reads as the standard, expected address for a
  site's general contact page without implying team size (unlike
  `team@`) or scope-limiting to press/content (unlike `editorial@`),
  which matters since the site is deliberately kept unbranded/separate
  from TeredaTrades' identity.
- Set up as a Google Group (not a licensed user, to avoid cost):
  name "MoneyMattersDaily Contact", email
  `contact@moneymattersdaily.money`, description "Contact form/inbox
  for moneymattersdaily.money — forwards to the site's editorial
  contact.", owner added: the existing TeredaTrades mailbox.
- Access type had to be switched from the "Public" preset to
  **Custom**, specifically checking the **External** column on the
  "Who can post" row. Default presets don't allow non-Workspace
  senders to post — since site visitors emailing in are external by
  definition, mail would otherwise bounce.
- **Note:** `/contact` page and footer still reference `hello@` —
  need to update both to `contact@` (not yet done).

### Deliverability: test email landed in spam
- First test send (from an outside Gmail account) did arrive, but in
  Spam, not Inbox — expected for a domain with no sending reputation
  yet. Marked "Not spam" on the test message.
- Checked Email setup status in Google Admin: SPF and DKIM both showed
  "Missing" (MX showed "Pending activation" but mail was already
  flowing, so that badge appears to lag actual status).
- Added SPF manually as a TXT record on `@` in Namecheap:
  `v=spf1 include:_spf.google.com ~all` — this is Google's fixed,
  domain-agnostic recommended value, safe to type manually rather than
  copy from the (truncated-in-UI) recommended-value column.
- DKIM is domain-specific (a generated key), so it has to come from
  Google Admin → Authenticate email, not typed manually. First attempt
  failed — cause: Google enforces a 24–72 hour cooldown after Gmail is
  first enabled on a domain before a DKIM key can be generated, and
  Gmail was only enabled on this domain the day before (2026-08-17).
  **Open item: retry DKIM generation after the cooldown passes**, then
  add the resulting TXT record to Namecheap.
- Also caught and corrected a wrong-domain mistake before it caused
  damage: the Authenticate Email page defaults to whichever domain was
  last selected (was `teredatrades.com`) — switched to
  `moneymattersdaily.money` before generating anything, to avoid
  touching teredatrades.com's existing DKIM setup.

### Open items (carried over + new)
- ~~Update `/contact` page and footer from `hello@` to `contact@`.~~
  Done 2026-08-18 — only `/contact` referenced it (footer doesn't link
  an email directly); updated and pushed.
- Retry DKIM key generation for moneymattersdaily.money once past the
  24–72hr post-Gmail-activation cooldown (Gmail enabled 2026-08-17, so
  should be clear sometime 2026-08-18 evening through 2026-08-20).
- MX still shows "Pending activation" badge in Google Admin despite
  mail delivery already working — worth rechecking once DKIM is done,
  may just resolve itself.
- Twitter/Pinterest footer links still placeholders (carried over,
  unchanged).
- Still just 5 posts total — keep publishing from
  `content-pipeline/keyword-queue.json` before applying to ad networks
  (carried over, unchanged).

---

## 2026-08-17 (later still) — Images + second post

### Images
- Added `PillarIcon.astro` — 5 hand-drawn line icons (one per pillar:
  budgeting, saving, credit, investing-basics, app-comparisons), single
  accent navy (#1f3a5f) via `currentColor`. Wired into main nav, pillar
  page headings, and homepage post-list badges.
- Deliberately avoided stock photos — no attribution overhead, keeps
  the "plain and credible" identity from the README, avoids the
  generic-stock-photo look that also reads as unfinished/AI-templated.
- Added `BudgetDonut.astro` — a functional (not decorative) donut chart
  illustrating the 50/30/20 split, injected into that specific post via
  a small slug→illustration map in `[slug].astro`. Chose this over MDX
  so post content stays plain markdown, matching the README's
  intentionally simple no-pipeline process. Future posts needing a
  custom illustration follow the same pattern (add to the map).

### Second post
- Published `how-much-emergency-fund.md` (saving pillar) — chose this
  over the next-in-queue budgeting keyword to give the homepage pillar
  diversity with only two live posts.
- Deliberately varied structure vs. the first post (income-stability
  scenarios instead of a bucket list) and included an explicit
  point of view (the two-income case is called out as the one place
  going under the "standard" 3-6mo advice is defensible) rather than
  hedging every claim — per the "feels AI-generated" discussion earlier
  in this project. Cross-links to the 50/30/20 post for the "needs"
  baseline number.
- Marked the keyword `published` in `content-pipeline/keyword-queue.json`.

### Open items (carried over)
- `hello@moneymattersdaily.money` still needs setup as a forwarding
  group/alias (not a paid user).
- MX verification in Google Admin still pending — recheck later.
- Footer social links (Twitter, Pinterest) still placeholders.
- Two posts live now — still thin for ad-network application; keep
  publishing before applying to Adsterra/PropellerAds.

---

## 2026-08-17 (later) — Google Workspace email setup for the domain

### What we did
- Added `moneymattersdaily.money` to the existing TeredaTrades Google
  Workspace account as a **secondary domain** (not user-alias domain).
  Reasoning: user-alias ties the address directly to
  `mike@teredatrades.com` (same underlying identity, defeats the
  unbranded-separation goal). Secondary domain lets us create a
  genuinely separate-looking address.
- **Cost note**: adding the secondary domain itself is free either way.
  Cost only appears if you create a brand-new *licensed user* on it. To
  avoid that, the plan is to set `hello@moneymattersdaily.money` up as a
  **group/alias that forwards to the existing mailbox**, not a new paid
  user — this part is not yet done (see open items).
- Domain ownership verified via TXT record
  (`google-site-verification=...`) added in Namecheap Advanced DNS,
  alongside the existing SPF TXT record — multiple TXT records on `@` is
  fine, no conflict.
- Gmail/MX activation: Namecheap's Host Records "Type" dropdown does NOT
  list MX directly — it lives in the separate **Mail Settings** section
  further down the Advanced DNS page. Selected the **"Gmail"** preset
  there (instead of manually entering an MX record), which
  auto-configures the correct MX record server-side non-visibly in the
  Host Records table.
- Google's live MX verification check failed on first attempt
  ("Unable to verify at the moment") — this is expected/normal, MX
  propagation is slower than the TXT check. Clicked "Do this later"
  rather than retrying repeatedly; nothing else (site, domain
  verification, DNS) is blocked by this. Re-check later via Admin
  console → Account → Domains → Manage domains.

### Investigated: is this the same issue as teredatrades.com's search-indexing problem?
Checked against the previously diagnosed root cause for teredatrades.com
(GitHub Pages SSL cert stuck because Cloudflare's proxy served its own
IPs instead of GitHub's, breaking the ACME challenge). **Not the same
issue here** — verified `moneymattersdaily.money` resolves directly to
GitHub Pages' real IPs (185.199.108-111.153) with no proxy in front of
it, since DNS is managed plain through Namecheap. `pending_domain_unverified_at`
and `protected_domain_state` both clear on GitHub's side. The only thing
pending is normal SSL cert issuance time, not a structural DNS conflict.

### Resolved: "Action required" email
The red "Action needed" badges in Google Admin's domain list (for both
teredatrades.com and moneymattersdaily.money) are just the MX-pending
status described above, not a new problem. Separately, a stale browser
tab titled "Action required: Verify your..." turned out to be the same
Namecheap WHOIS contact-verification email already completed earlier in
this session (same verification key) — no outstanding action, just an
old tab left open.

### Open items (carried over + new)
- `hello@moneymattersdaily.money` still needs to be set up as a
  forwarding group/alias (not a paid user) once the secondary domain
  finishes verifying.
- MX verification in Google Admin still pending — recheck later.
- Footer social links (Twitter, Pinterest) still placeholders — need
  real accounts before going live.
- Site still needs images and more posts with varied
  structure/voice — this is the main blocker before applying to
  Adsterra/PropellerAds, more than any remaining DNS/email task.

---

## 2026-08-17 — Deployment + ad-readiness review

### Deployment
- Domain `moneymattersdaily.money` registered via Namecheap.
- Hosting: **GitHub Pages** (not Netlify) — the TeredaTrades Netlify team is
  currently on paused operational credits (production deploys blocked), and
  Pages has no billing/credits system to run into. Tradeoff accepted: no
  per-PR preview deploys, no built-in forms/redirects (irrelevant, site is
  fully static).
- Repo made **public** (required for Pages on a free GitHub plan). Full
  history scanned first — no secrets/keys/tokens found, safe to flip.
- `.github/workflows/deploy.yml` — builds with `npm ci && npm run build`,
  deploys `dist/` via `actions/deploy-pages`. Node pinned to **22** (matches
  `package.json` engines: `>=22.12.0` — a Node 20 pin caused the first
  deploy attempt to fail at the build step).
- `astro.config.mjs` — added `site: 'https://moneymattersdaily.money'` for
  correct canonical URLs / sitemap.
- `public/CNAME` — contains `moneymattersdaily.money`, sets the custom
  domain on GitHub's side automatically.
- DNS (Namecheap Advanced DNS): 4x A record on `@` → GitHub Pages IPs
  (185.199.108.153 / .109.153 / .110.153 / .111.153), 1x CNAME on `www` →
  `teredatrades.github.io`. Old parking-page CNAME and domain redirect
  removed (would have conflicted). Parking page toggle turned off.
- Domain contact (WHOIS) verification completed — was flagged ALERT,
  now ACTIVE.
- Live at `http://moneymattersdaily.money/`. HTTPS cert auto-provisions
  once DNS is verified — check Settings → Pages → Enforce HTTPS once
  available.

### Ad-network readiness review
Discussed before applying to PropellerAds/Adsterra (per README, the two
best fits for a zero-traffic start):

- **Timing**: no hard traffic minimum on Adsterra/PropellerAds, but
  approval odds and payout quality improve substantially around ~5,000+
  monthly visitors and a site that reads as actively maintained, not a
  shell. Realistic minimum: 4-8 weeks of consistent publishing + organic
  traffic, longer for finance (YMYL) since Google is slower to trust new
  sites in this niche. Media.net / Infolinks (saved for later per README)
  are pickier than this.
- **Current state honest take**: not ready yet. One post, no images, no
  author/trust signals, no way to contact anyone — reads as unfinished to
  both manual ad reviewers and readers.
- **Language toggle**: decided against, for now. Downsides outweigh
  upside at this stage — translation accuracy risk for financial terms,
  SEO risk if implemented without hreflang/separate URLs, and no evidence
  of non-English demand yet. Revisit only if traffic data shows it.
- **Trust/E-E-A-T pages added this session**: `/about`, `/contact`,
  `/disclaimer` (financial disclaimer + privacy/cookies note), nav +
  footer links to all three, plus footer social placeholders.
- **"Feels AI-generated" fix**: not a tooling problem — an editorial one.
  Plan: more specificity/numbers per post, vary post structure instead of
  one repeated template, keep an actual point of view instead of hedging
  both sides, add "last updated" dates and occasional post revisions.

### Open items / not yet done
- Footer social links (Twitter, Pinterest) are **placeholders pointing to
  handles that don't exist yet** — need real accounts created, then swap
  in the actual URLs (a dead social link is worse than none).
- Contact email `hello@moneymattersdaily.money` is not yet a working
  inbox — needs Namecheap Private Email or a forwarding rule set up.
- Add images (stock or simple SVG icons) — site is currently text-only.
- Write more posts with varied structure/voice before applying to ad
  networks.
- HTTPS enforcement pending cert auto-provision (check back in Pages
  settings).
