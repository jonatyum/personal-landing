import type { APIRoute } from 'astro';
import { langHome, langs, locales } from '../i18n/ui';

// One entry per language, each listing the others as alternates.
// Without SITE_URL there are no absolute URLs to list, so the sitemap is empty.
export const GET: APIRoute = ({ site }) => {
  const urls = site
    ? langs
        .map((lang) => {
          const alternates = langs
            .map(
              (other) =>
                `\n    <xhtml:link rel="alternate" hreflang="${locales[other].hreflang}" href="${new URL(langHome(other), site).href}" />`,
            )
            .join('');
          return `  <url><loc>${new URL(langHome(lang), site).href}</loc>${alternates}\n  </url>`;
        })
        .join('\n')
    : '';
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
