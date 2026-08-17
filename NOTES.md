# Project notes / decision log

Running log of setup decisions and open items. Newest entries at top.

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
