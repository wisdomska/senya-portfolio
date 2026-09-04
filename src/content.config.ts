import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Case studies. Every field is validated, so a typo in a markdown file fails
 * the build rather than rendering an empty section on the live site.
 */
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      /** Proper-case name used in headings, <title> and next/prev nav. */
      title: z.string(),
      /** All-caps wordmark treatment used for the case-study <h1>. */
      displayTitle: z.string(),
      /** One-line summary. Doubles as the meta description seed. */
      tagline: z.string(),
      /** Longer label shown on the Projects grid card. */
      cardTitle: z.string(),

      /** Drives grid order, and next/prev navigation. Unique across the set. */
      order: z.number().int().positive(),
      featured: z.boolean().default(false),
      lab: z.boolean().default(false),

      /** Filter chips are derived from the union of these two across all entries. */
      category: z.array(z.string()).nonempty(),
      tags: z.array(z.string()).nonempty(),

      /* --- Meta strip (six fields, in display order) --- */
      client: z.string(),
      service: z.string(),
      duration: z.string(),
      year: z.string().regex(/^\d{4}$/),
      tools: z.array(z.string()).nonempty(),
      platform: z.string(),

      /* --- Supporting metadata --- */
      industry: z.string(),
      role: z.string(),
      scope: z.string(),
      depth: z.enum(['Full case study', 'Short case study', 'Gallery item']),
      engagement: z.string().optional(),

      cover: z.object({ src: image(), alt: z.string() }),
      gallery: z
        .array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() }))
        .default([]),

      /* --- Narrative --- */
      background: z.string(),
      targetUsers: z.array(z.string()).nonempty(),
      goal: z.string(),
      process: z.array(z.string()).nonempty(),
      keyDecisions: z.array(z.string()).nonempty(),
      solution: z.string(),
      keyFeatures: z.array(z.string()).nonempty(),
      designSystemNotes: z.string(),
      outcome: z.string(),
      byTheNumbers: z.string(),
      whatILearned: z.string(),

      prototypeUrl: z.string().url(),
      prototypeLabel: z.string().default('View the prototype'),
    }),
});

export const collections = { projects };
