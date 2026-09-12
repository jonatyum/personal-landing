// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig, fontProviders } from 'astro/config';

const { SITE_URL, BASE_PATH } = process.env;

// public/CNAME holds the domain the site is published under, so it is also the default for
// `site`: canonical URLs, the sitemap and the language alternates then never depend on an
// environment variable being set, in CI or anywhere else.
const cname = existsSync('public/CNAME') ? readFileSync('public/CNAME', 'utf8').trim() : '';
const site = SITE_URL || (cname && `https://${cname}`);

export default defineConfig({
  ...(site ? { site } : {}),
  // GitHub Pages project sites live under /<repo>; custom domains use the root.
  ...(BASE_PATH ? { base: BASE_PATH } : {}),
  trailingSlash: 'always',
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Space Grotesk',
      cssVariable: '--font-display',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: ['400 500'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],
});
