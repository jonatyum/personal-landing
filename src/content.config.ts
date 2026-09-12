import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

// Every YAML file holds a single `main` entry; lists live inside it so their order is the file's order.
// Translatable strings are { es, en? }: English is filled in during the i18n phase.
const text = z.object({ es: z.string().min(1), en: z.string().min(1).optional() });
const sectionKey = z.enum(['experience', 'projects', 'track', 'about', 'education', 'contact']);
const url = z.url();

const single = <T extends z.ZodType>(name: string, schema: T) =>
  defineCollection({ loader: file(`src/content/${name}.yaml`), schema });

export const collections = {
  site: single(
    'site',
    z.object({
      name: z.string(),
      monogram: z.string().max(3),
      handle: z.string(),
      jobTitle: text,
      location: z.object({ locality: z.string(), country: z.string(), countryCode: z.string().length(2) }),
      seo: z.object({ title: text, description: text }),
      knowsAbout: z.array(z.string()),
      links: z.object({ github: url, codeforces: url, linkedin: url.optional() }),
      email: z.email().optional(),
    }),
  ),

  hero: single(
    'hero',
    z.object({
      eyebrow: text,
      status: text,
      title: text,
      titleAccent: text,
      subtitle: text,
      primaryCta: z.object({ label: text, section: sectionKey }),
      secondaryCta: z.object({ label: text, section: sectionKey }),
      tech: z.array(z.string()).min(1),
      code: z.object({
        file: z.string(),
        lines: z.array(z.array(z.object({ t: z.string(), c: z.enum(['kw', 'ann', 'str', 'fn', 'var', 'pun']) }))),
      }),
      terminal: z.object({ project: z.string(), command: z.string(), result: text }),
      proofs: z.array(z.object({ value: text, label: text })).length(4),
    }),
  ),

  sections: single(
    'sections',
    z.record(sectionKey, z.object({ lead: text.optional(), intro: text.optional() })),
  ),

  experience: single(
    'experience',
    z.object({
      jobs: z.array(
        z.object({
          role: text,
          org: z.string(),
          orgDetail: text.optional(),
          period: text,
          start: z.string().regex(/^\d{4}(-\d{2})?$/),
          end: z.string().regex(/^\d{4}(-\d{2})?$/).optional(),
          summary: text,
          achievements: z.array(text).default([]),
        }),
      ),
      stackTitle: text,
      stack: z.array(z.object({ label: text, items: z.array(z.string()).min(1) })),
    }),
  ),

  projects: single(
    'projects',
    z.object({
      items: z.array(
        z.object({
          id: z.string(),
          featured: z.boolean().default(false),
          title: z.string(),
          context: text,
          headline: text,
          body: text,
          tags: z.array(z.string()),
          repo: url,
          demo: url.optional(),
        }),
      ),
      archive: z.object({ title: text, body: text, link: url }),
      repoLabel: text,
    }),
  ),

  track: single(
    'track',
    z.object({
      caption: text,
      columns: z.object({ year: text, event: text, place: text, role: text }),
      rows: z.array(
        z.object({
          year: z.number().int(),
          event: text,
          place: z.string(),
          role: text,
          highlight: z.boolean().default(false),
        }),
      ),
      profile: z.object({ label: text, url }),
    }),
  ),

  about: single(
    'about',
    z.object({
      bio: z.array(text).min(1),
      principlesTitle: text,
      principles: z.array(z.object({ title: text, proof: text })),
    }),
  ),

  education: single(
    'education',
    z.object({
      degreesTitle: text,
      degrees: z.array(z.object({ title: text, org: z.string(), detail: text.optional(), year: z.string().optional() })),
      coursesTitle: text,
      courses: z.array(z.object({ title: z.string(), org: z.string(), year: z.string() })),
    }),
  ),

  contact: single(
    'contact',
    z.object({
      title: text,
      body: text,
      linksTitle: text,
    }),
  ),
};
