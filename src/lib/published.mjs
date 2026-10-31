// Scheduled publishing: a post is LIVE when it is not a draft AND its pubDate
// has arrived. pubDate is a plain date in frontmatter (YAML parses it as
// midnight UTC), so a post dated D goes live in the first build that runs on
// or after 00:00 UTC on D. A daily scheduled deploy (see
// .github/workflows/deploy.yml) makes that happen with nobody at the keyboard.
//
// SITE_NOW (ISO date) overrides "now" so the rule can be tested without
// waiting, e.g.  SITE_NOW=2099-01-01 npm run build
//
// Used by: the Astro pages (index, pillar, blog/[slug]), the Pinterest feed
// generator and scripts/prune-unpublished-assets.mjs. Past-dated posts behave
// exactly as before (live immediately).

export function siteNow() {
  return process.env.SITE_NOW ? new Date(process.env.SITE_NOW) : new Date();
}

/** @param {{ draft?: boolean, pubDate: Date | string }} data */
export function isLive(data, now = siteNow()) {
  return !data.draft && new Date(data.pubDate).getTime() <= now.getTime();
}
