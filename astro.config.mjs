// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Mirrors src/data/site.ts. Astro needs the origin at config time (before any
// module graph exists) for the sitemap and canonical URLs, so the fallback is
// repeated here and nowhere else.
const SITE_URL = process.env.PUBLIC_SITE_URL ?? 'https://wisdomska.vercel.app';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  build: {
    // Emit /projects.html rather than /projects/index.html so Vercel's
    // cleanUrls serves /projects with no redirect hop.
    format: 'file',
    assets: '_assets',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'monthly',
    }),
  ],
  image: {
    // AVIF first, WebP fallback; both generated at build time by sharp.
    responsiveStyles: true,
  },
  devToolbar: { enabled: false },
});
