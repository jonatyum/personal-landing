// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

const { SITE_URL, BASE_PATH } = process.env;

export default defineConfig({
  ...(SITE_URL ? { site: SITE_URL } : {}),
  // GitHub Pages project sites live under /<repo>; custom domains use the root.
  ...(BASE_PATH ? { base: BASE_PATH } : {}),
  trailingSlash: 'always',
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-display',
      weights: ['600 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Geist',
      cssVariable: '--font-body',
      weights: ['400 600'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Geist Mono',
      cssVariable: '--font-mono',
      weights: ['400 500'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],
});
