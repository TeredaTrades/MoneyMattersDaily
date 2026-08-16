# MoneyMattersDaily

Testbed personal-finance blog for evaluating ad networks (Media.net, Adsterra, PropellerAds, Infolinks) ahead of rolling monetization out to TeredaTrades' broader apps/sites portfolio.

Separate, unbranded identity — no link back to TeredaTrades on the public site. Finance is a YMYL (Your Money or Your Life) content category, so the site is deliberately plain and credible: no email capture, no sign-up funnels, no fake urgency, no lead-gen-style CTAs. It should read like someone explaining something, not a business trying to convert a visitor.

## Stack

- **Astro** (static site generator) — fast, strong default SEO, cheap/free hosting, fully static (no server, no backend — every ad network here works via a client-side script anyway)
- Content stored as markdown files under `src/content/blog/`, one file per post
- Topic pillars: `budgeting`, `saving`, `credit`, `investing-basics`, `app-comparisons`
- Ad placements are wired into the template now (`src/components/AdSlot.astro`) as empty slots — adding a network later is a one-line script drop-in, not a redesign

## Content process (chat-batch, no external API dependency)

No automated pipeline and no third-party API calls run in this repo — that was a deliberate choice to avoid adding a service the whole thing depends on (API keys, rate limits, silent failures).

Instead:

1. `content-pipeline/keyword-queue.json` holds the list of target keywords/topics, in priority order
2. Periodically (weekly/biweekly), bring the next few pending keywords to a Claude chat session and get drafts
3. Review them right there, then commit the finished markdown files to `src/content/blog/` and mark the keywords `published` in the queue
4. Push directly, or open a PR first if you want a review step in git itself

Keyword list is a starting set based on general topic-fit reasoning, not verified search-volume data — worth running it through a real keyword tool (Ahrefs/Ubersuggest/Google Keyword Planner) before scaling it.

## Local dev

```
npm install
npm run dev      # local preview
npm run build    # static build to dist/
```

## Status / open items

- Domain not yet registered — verify `moneymattersdaily.com` (or a `.money`/`.blog` alternative) availability before launch
- No ad network wired in yet — apply to PropellerAds and Adsterra first (best fit for zero-traffic start + non-PayPal, crypto-friendly payout options), Media.net and Infolinks later once there's traffic history
- Hosting not yet chosen — GitHub Pages or Netlify free tier are the natural next step
