/**
 * Single source of truth for the site's identity and absolute URL.
 *
 * SITE_URL is the ONLY place the production origin is written down. Canonical
 * tags, og:url, the sitemap, JSON-LD and the share-card generator all derive
 * from it, so moving to a custom domain is a one-line change here (or, better,
 * setting PUBLIC_SITE_URL in the Vercel dashboard and touching nothing at all).
 */
export const SITE_URL =
  import.meta.env.PUBLIC_SITE_URL ?? 'https://wisdomska.vercel.app';

export const SITE_NAME = "Senya's Portfolio";
export const SITE_SHORT_NAME = 'Senya';
export const OWNER_NAME = 'Wisdom Senya Agbetsiafa';
export const OWNER_ALIAS = 'Senya';
export const OWNER_ROLE = 'UI/UX & Graphic Designer';
export const OWNER_LOCATION = 'Accra, Ghana';
export const OWNER_EMAIL = 'wisdomska@gmail.com';
export const OWNER_PHONE_E164 = '+233545554665';

/** Brand background, mirrored by <meta name="theme-color"> and the manifest. */
export const THEME_COLOR = '#111111';

export const CV_PATH = '/docs/senya-cv.pdf';
export const CV_FILENAME = 'Wisdom-Agbetsiafa-CV.pdf';

export const SOCIALS = [
  { label: 'Email', href: `mailto:${OWNER_EMAIL}`, icon: 'mail' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/wisdomska', icon: 'linkedin' },
  { label: 'WhatsApp', href: `https://wa.me/${OWNER_PHONE_E164.replace('+', '')}`, icon: 'whatsapp' },
  { label: 'Pinterest', href: 'https://www.pinterest.com/69senya', icon: 'pinterest' },
] as const;

/** Profile URLs advertised to search engines via JSON-LD `sameAs`. */
export const SAME_AS = SOCIALS.filter((s) => s.href.startsWith('https://')).map((s) => s.href);

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Build an absolute URL from a site-relative path. */
export const abs = (path: string): string => new URL(path, SITE_URL).href;
