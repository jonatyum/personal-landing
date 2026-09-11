import { base } from 'astro:config/client';

// Read from the Astro config, not import.meta.env.BASE_URL: during the build Astro exposes
// process.env on import.meta.env, so a BASE_URL variable in the shell would override it.
const root = `${base.replace(/\/+$/, '')}/`;

/** Prefixes a path with the configured base (GitHub Pages project sites live under /<repo>/). */
export function withBase(path = '') {
  return `${root}${path.replace(/^\/+/, '')}`;
}
