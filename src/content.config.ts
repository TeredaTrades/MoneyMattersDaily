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
    pillar: z.enum(['budgeting', 'saving', 'credit', 'investing-basics', 'app-comparisons']),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
