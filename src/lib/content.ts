import { getEntry, type CollectionKey, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

/** Reads the single `main` entry of a collection. Fails the build if the file is missing or unreadable. */
export async function single<C extends CollectionKey>(collection: C): Promise<CollectionEntry<C>['data']> {
  const entry = await getEntry(collection, 'main');
  if (!entry) throw new Error(`Missing content: src/content/${collection}.yaml has no "main" entry.`);
  return entry.data;
}

export type Localized = { es: string; en?: string | undefined };

/** Picks the string for a language, falling back to Spanish until the English copy exists. */
export function pick(value: Localized, lang: Lang): string {
  return value[lang] ?? value.es;
}
