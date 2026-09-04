import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/site';

/** Generated so the sitemap URL follows SITE_URL rather than being hardcoded. */
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', SITE_URL).href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
