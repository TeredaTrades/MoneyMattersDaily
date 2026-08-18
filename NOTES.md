# Project notes / decision log

Running log of setup decisions and open items. Newest entries at top.

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
