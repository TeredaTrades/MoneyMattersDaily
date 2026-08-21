import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    // Which search keyword this post targets — helps track testbed performance per topic
    targetKeyword: z.string(),
    pillar: z.enum([
      'budgeting',
      'saving',
      'credit',
      'investing-basics',
      'app-comparisons',
      'travel-finance',
      'news-trends',
    ]),
    draft: z.boolean().default(false),
    // Optional short equation/formula shown on the Pinterest pin between the
    // pillar icon and title (e.g. "Income − Expenses = $0"). Keep it short —
    // it renders as one line at a fixed size, no wrapping.
    equation: z.string().optional(),
    // Which visual fills the pin's icon area. Defaults to the pillar's
    // standard line-icon (e.g. the pie chart for budgeting) so most posts
    // need no change. Use a non-default value sparingly, to break up visual
    // repetition when several posts share a pillar — not on every post.
    //   'icon'   — the pillar's standard line-icon (default)
    //   'equation' — no icon; the `equation` field renders large, centered
    //   'flow'   — a short this → this → this step chain (see flowSteps)
    //   'table'  — a small 2–3 row label/value table (see tableRows)
    //   'plain'  — no icon, no equation, no table — title-forward only
    pinVisual: z.enum(['icon', 'equation', 'flow', 'table', 'plain']).default('icon'),
    // Used when pinVisual is 'flow'. 3–4 short steps (few words each).
    flowSteps: z.array(z.string()).max(4).optional(),
    // Used when pinVisual is 'table'. 2–3 label/value rows.
    tableRows: z.array(z.object({ label: z.string(), value: z.string() })).max(3).optional(),
    // Set to true only after a human has reviewed the generated Pinterest pin image
    // (see scripts/generate-pin.mjs and .github/workflows/pin-preview.yml).
    // Only pinApproved posts are included in /pinterest-feed.xml.
    pinApproved: z.boolean().default(false),
  }),
});

export const collections = { blog };
