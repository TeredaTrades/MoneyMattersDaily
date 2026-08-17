# Project notes / decision log

Running log of setup decisions and open items. Newest entries at top.

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
