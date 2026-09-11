import type { APIRoute } from 'astro';
import { withBase } from '../site';

// Pages listed for search engines. /en/ joins this list in the i18n phase.
const paths = [''];

// Without SITE_URL there are no absolute URLs to list, so the sitemap is empty.
export const GET: APIRoute = ({ site }) => {
  const urls = site
    ? paths.map((path) => `  <url><loc>${new URL(withBase(path), site).href}</loc></url>`).join('\n')
    : '';
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
