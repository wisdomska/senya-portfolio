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
  markdown: {
    // Case-study markdown bodies are empty — every field is front matter — so
    // there is no code to highlight, and Shiki's inline styles would need an
    // 'unsafe-inline' style-src.
    syntaxHighlight: false,
  },

  security: {
    /**
     * Astro emits the Content-Security-Policy as a <meta> tag with a hash for
     * every inline script and style it generates, so the policy can forbid
     * inline execution outright without an 'unsafe-inline' escape hatch.
     *
     * The directives that a <meta> CSP cannot carry — frame-ancestors — stay
     * in vercel.json alongside X-Frame-Options.
     */
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "img-src 'self' data:",
        "font-src 'self'",
        "media-src 'self'",
        "manifest-src 'self'",
        "connect-src 'self' https://api.web3forms.com",
        "form-action 'self' https://api.web3forms.com",
      ],
      styleDirective: {
        // style-src-attr does not fall back to style-src, so the two scopes
        // are declared separately: hashed stylesheets for elements, and
        // 'unsafe-inline' for the style attributes that <Image> and the
        // footer background plate emit.
        resources: [
          { resource: "'self'", kind: 'element' },
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
      },
      scriptDirective: {
        resources: ["'self'"],
      },
    },
  },

  vite: {
    css: {
      /**
       * Vite processes CSS with Lightning CSS, which rewrites vendor prefixes
       * to suit its targets. With none configured it kept
       * -webkit-backdrop-filter and dropped the standard backdrop-filter
       * outright — and Firefox only supports the unprefixed property, so every
       * glass panel in the site rendered completely flat there.
       *
       * Naming the targets keeps both declarations. Versions are encoded as
       * major << 16, which is Lightning CSS's format.
       */
      transformer: 'lightningcss',
      lightningcss: {
        targets: {
          chrome: 107 << 16,
          edge: 107 << 16,
          firefox: 104 << 16,
          safari: 16 << 16,
          ios_saf: 16 << 16,
        },
      },
    },
  },

  devToolbar: { enabled: false },
});
