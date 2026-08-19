// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://moneymattersdaily.money',
  // Static build output puts each page at path/index.html, and the
  // post-build sitemap generator (scripts/generate-sitemap.mjs) reflects
  // that by listing every URL with a trailing slash. Without this setting,
  // canonical/OG URLs were built from whatever path a visitor happened to
  // request (Astro.url.pathname in BaseLayout.astro), which could omit the
  // trailing slash — creating a mismatch between the sitemap's URL for a
  // page and that page's own canonical tag. Google Search Console showed
  // this directly: inspecting a non-trailing-slash URL reported "No
  // referring sitemaps detected" even though the page was in the sitemap.
  // Forcing 'always' makes every internal link, canonical tag, and OG/
  // Twitter URL consistently match the sitemap's trailing-slash format.
  trailingSlash: 'always',
});
