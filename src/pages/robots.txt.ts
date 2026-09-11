import type { APIRoute } from 'astro';
import { withBase } from '../site';

// Crawlers only read robots.txt at the host root, so this one matters once the site has its own domain.
export const GET: APIRoute = ({ site }) => {
  const lines = ['User-agent: *', 'Allow: /'];
  if (site) lines.push(`Sitemap: ${new URL(withBase('sitemap.xml'), site).href}`);
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
