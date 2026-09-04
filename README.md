# Senya's Portfolio

The personal portfolio of **Senya** — Wisdom Senya Agbetsiafa, UI/UX & Graphic
Designer, Accra, Ghana.

**Live: <https://wisdomska.vercel.app>**

Thirteen case studies, a filtered project archive, a contact form, and a
dark, gradient-accented design built around a giant outlined `SENYA` wordmark.

---

## Contents

- [Stack, and why](#stack-and-why)
- [Folder structure](#folder-structure)
- [Local setup](#local-setup)
- [Adding a new case study](#adding-a-new-case-study)
- [Updating the CV](#updating-the-cv)
- [Fonts](#fonts)
- [Environment variables](#environment-variables)
- [Deploying](#deploying)
- [Branching and pull requests](#branching-and-pull-requests)
- [Budgets](#budgets)
- [Pointing a custom domain at the site](#pointing-a-custom-domain-at-the-site)

---

## Stack, and why

**[Astro](https://astro.build) 7**, static output, zero JavaScript by default.

The site began life as a Claude Design export: four canvas artboards that
compiled themselves in the browser with React and Babel pulled from a CDN. That
had to be rewritten whatever framework came next, so the choice was really
about what happens _afterwards_.

- **Astro keeps HTML and CSS as the authoring language.** An `.astro` file is
  an HTML file with a frontmatter fence. There is no JSX requirement and no
  component lifecycle to learn.
- **The nav and footer exist once.** In the export they were copied into all
  four pages; a nav change was a four-file edit and would have been a
  seventeen-file edit once the case studies became real pages.
- **Case studies are content, not markup.** They live as markdown with
  validated frontmatter, so adding one is writing a file — see below.
- **It ships no framework runtime.** The only JavaScript on the page is the
  handful of modules in `src/scripts/`.

A plain multi-page static site was the alternative. It was rejected because
this project already needs generated case-study pages, a generated sitemap,
generated share cards and generated responsive images — so "no build step" was
never actually on the table. Choosing vanilla would have meant hand-writing a
site generator in `scripts/` and maintaining it forever. Astro is that
generator, maintained by someone else.

Next.js was rejected because it would ship a React runtime to render a static
portfolio, for a site with no CMS, no blog and no authenticated pages. If a
blog ever arrives, Astro adds one without a rewrite.

### Every dependency, and why it is here

| Package                                                | Why                                                                                                                               |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `astro`                                                | The framework and static site generator.                                                                                          |
| `@astrojs/sitemap`                                     | Generates `sitemap-index.xml` from the routes.                                                                                    |
| `sharp`                                                | Image pipeline — AVIF/WebP at multiple widths, plus the favicon and share-card rendering.                                         |
| `lenis`                                                | The smooth-scrolling behaviour from the original design. Self-hosted rather than loaded from a CDN, so the CSP can stay strict.   |
| `satori`                                               | Renders the share cards to SVG with embedded glyph outlines, so they do not depend on fonts being installed on the build machine. |
| `gray-matter`                                          | Reads case-study frontmatter in the share-card script (which runs outside Astro).                                                 |
| `subset-font`, `fontkit`                               | Dev only. Subset the licensed fonts to WOFF2 and measure the fallback metrics.                                                    |
| `eslint` + plugins, `stylelint`, `prettier` + plugin   | Dev only. The three linters CI runs.                                                                                              |
| `@astrojs/check`, `typescript`                         | Dev only. Type-checks `.astro` and `.ts`.                                                                                         |
| `html-validate`, `pa11y-ci`, `@lhci/cli`, `linkinator` | Dev only. The four CI audits.                                                                                                     |

Analytics adds no dependency at all — the two Vercel scripts are served from
this origin and are included as plain `<script>` tags.

---

## Folder structure

```
senya-portfolio/
├── .github/workflows/ci.yml     # lint, build, a11y, links, Lighthouse
├── public/                      # copied verbatim to the site root
│   ├── fonts/                   # subset .woff2 (see "Fonts")
│   ├── flags/                   # 198 country flags, self-hosted
│   ├── tools/                   # marquee logos
│   ├── icons/                   # social + decorative SVGs
│   ├── og/                      # generated 1200x630 share cards
│   ├── docs/senya-cv.pdf
│   ├── hero.mp4
│   └── favicon.*, icon-*.png, site.webmanifest
├── scripts/
│   ├── subset-fonts.mjs         # TTF/OTF -> subset WOFF2 + fallback metrics
│   ├── generate-icons.mjs       # brand mark -> favicon set
│   └── generate-og.mjs          # content -> share cards
├── src/
│   ├── assets/                  # images Astro optimises at build time
│   │   ├── brand/               # logo, mark, wordmark, portrait, footer plate
│   │   └── projects/            # one cover per case study
│   ├── components/              # Nav, Footer, ProjectCard, ContactForm, ...
│   ├── content/projects/*.md    # THE CASE STUDIES — one file each
│   ├── content.config.ts        # zod schema that validates them
│   ├── data/                    # site.ts, career.ts, credentials.ts, ...
│   ├── layouts/                 # BaseLayout, CaseStudyLayout
│   ├── pages/                   # routes
│   ├── scripts/                 # client-side modules
│   └── styles/                  # tokens -> reset -> base -> layout ->
│                                # components -> pages -> utilities
├── src-fonts/                   # licensed font originals (NOT committed)
├── astro.config.mjs
├── vercel.json
└── package.json
```

Styles are ordered with `@layer`, declared once at the top of
`src/styles/main.css`. That is why the shipped CSS contains **no `!important`
at all** — the cascade is settled by layer order rather than by specificity
fights.

---

## Local setup

Requires Node 20.11 or newer (`.nvmrc` pins it).

```bash
npm install
npm run dev
```

The dev server runs at <http://localhost:4321>.

| Command           | What it does                                     |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Dev server with hot reload.                      |
| `npm run build`   | Production build into `dist/`.                   |
| `npm run preview` | Serve the built `dist/` locally.                 |
| `npm run lint`    | Prettier check, ESLint, Stylelint.               |
| `npm run format`  | Rewrite files with Prettier.                     |
| `npm run check`   | Astro/TypeScript type check.                     |
| `npm run og`      | Regenerate the share cards (needs `src-fonts/`). |
| `npm run fonts`   | Re-subset the fonts (needs `src-fonts/`).        |
| `npm run icons`   | Rebuild the favicon set from the brand mark.     |

---

## Adding a new case study

Written for someone who has not opened this repo in three months. Nothing here
requires touching a component.

### 1. Add the cover image

Drop a square PNG or JPG into `src/assets/projects/`. Name it
`work-<slug>.png`. Around 1000×1000 is right — Astro generates the AVIF and
WebP variants and every size the page needs, so do not pre-optimise it.

### 2. Create the markdown file

Create `src/content/projects/<slug>.md`. The filename **is** the URL: a file
called `acme-app.md` becomes `/work/acme-app`. Use lowercase and hyphens, and
no apostrophes.

Copy an existing file as a starting point — `src/content/projects/beatzy.md`
is a short one. Every field below is required unless marked optional.

```markdown
---
title: 'Acme App' # proper case; used in <title> and next/prev
displayTitle: 'ACME APP' # all caps; the big page heading
tagline: 'One line on what it is.' # also seeds the meta description
cardTitle: 'Acme - Mobile App' # the longer label on the Projects grid

order: 14 # position in the grid; also drives next/prev
featured: false # true puts it in Featured Works on the home page
lab: false # true appends "- Lab" to the discipline label

category: # becomes a filter chip
  - 'UI/UX Design'
tags: # also becomes filter chips
  - 'Designed'

client: 'Acme Ltd'
service: 'Mobile App — Marketplace'
duration: '6 weeks'
year: '2026'
tools:
  - 'Figma'
platform: 'iOS & Android'

industry: 'Retail'
role: 'Product Designer — end-to-end UX & UI'
scope: '40 screens'
depth: 'Full case study' # or 'Short case study' or 'Gallery item'
engagement: 'Client work' # optional

cover:
  src: '../../assets/projects/work-acme.png'
  alt: 'Acme App — one line on what it is'

background: 'The problem, in a paragraph.'
targetUsers:
  - 'Who it is for'
goal: 'What it had to achieve.'
process:
  - 'Research'
  - 'Wireframes'
  - 'UI'
keyDecisions:
  - 'The first call you made'
solution: 'What you built, in a paragraph.'
keyFeatures:
  - 'A feature'
designSystemNotes: 'How the system and accessibility were handled.'
outcome: 'What came of it.'
byTheNumbers: 'The one number worth quoting'
whatILearned: 'The honest lesson.'

prototypeUrl: 'https://www.figma.com/proto/...'
prototypeLabel: 'View the prototype' # optional; use 'View The Website' for live sites
---
```

Leave the body below the closing `---` empty. Every field the design renders
lives in the frontmatter.

**Apostrophes:** YAML single-quoted strings escape an apostrophe by doubling
it — `'it''s'`, not `'it\'s'`. Or wrap the whole value in double quotes.

### 3. Generate its share card

```bash
npm run og
```

This needs the font originals in `src-fonts/` — see [Fonts](#fonts). It writes
`public/og/<slug>.png`, which is committed.

### 4. Check it

```bash
npm run dev
```

Open `/work/<slug>` and `/projects`. The card appears in the grid, the filter
chips pick up any new category or tag automatically, and next/previous
navigation reorders itself around the new `order`.

If a field is missing or misspelled, the build stops with the field name and
the file — that is the zod schema in `src/content.config.ts` doing its job.

### 5. Ship it

```bash
git checkout -b case-study/acme-app
git add .
git commit -m "feat: add Acme App case study"
git push -u origin case-study/acme-app
```

Open a pull request. Vercel posts a preview URL on it and CI runs. Merge to
`main` when both are green, and production updates on its own.

> **Hiding a filter chip.** `HIDDEN_FILTERS` in `src/data/projects.ts` is the
> single place a chip is suppressed. `Graphic Design` is in there now because
> no project carries it yet. Remove it from that set and the chip returns.

---

## Updating the CV

Replace `public/docs/senya-cv.pdf`, keeping the filename. Both Download CV
buttons (nav and footer) point at it through `CV_PATH` in `src/data/site.ts`.
The name the visitor's browser saves it as is `CV_FILENAME` in the same file.

---

## Fonts

The site sets **Neue Haas Grotesk Display Pro** and **Digital Cards**. Both are
commercial faces.

Only the **subset WOFF2** files in `public/fonts/` are committed — those are
what the site serves. The full desktop originals are deliberately kept out of
the repository (`src-fonts/` is in `.gitignore`), because this repo is public.

To regenerate the fonts or the share cards, put the originals into
`src-fonts/` with these names and run the script:

```
src-fonts/NHD-Light.ttf         NHD-Roman.ttf          NHD-Medium.ttf
          NHD-Bold.ttf          NHD-RomanItalic.ttf    NHD-MediumItalic.ttf
          DigitalCards.otf
```

```bash
npm run fonts
```

The subset takes the seven faces from 673KB to 82.5KB. It also prints the
`size-adjust` / `ascent-override` numbers for the Arial fallback in
`src/styles/base.css`, so the swap to the real face does not shift the layout.

> **Confirm your licence covers web use.** A desktop licence usually does not.
> If it turns out you only hold desktop rights, the display face is used for
> exactly six short strings, and the body face would need replacing with a
> web-licensed equivalent — that is a change to two `@font-face` blocks and a
> re-run of `npm run fonts`.

---

## The hero video

`public/hero.mp4` is the background loop behind the hero and the two page
titles. The master from the Claude Design export was 2.49MB, 1280x720, with a
128 kb/s audio track that never plays because the element is always muted.

It ships re-encoded to **1.0MB**, audio stripped:

```bash
ffmpeg -i hero-master.mp4 -an   -c:v libx264 -profile:v high -crf 32 -preset veryslow   -pix_fmt yuv420p -movflags +faststart   public/hero.mp4
```

The loop renders at 15% opacity beneath a vignette, so the quality loss is not
visible: measured against the master, the mean per-pixel difference as
rendered is 0.55/255, about 0.2%.

It is still the single heaviest thing on the site, so it is:

- attached from `data-src` only when the element nears the viewport, so it
  never blocks first paint or the LCP;
- skipped entirely for `prefers-reduced-motion`, Data Saver and 2g
  connections — the hero keeps its tint, vignette and type either way.

**Trade-off worth knowing.** Without the video the home page transfers about
220KB. With it, about 1.25MB, which is over the 1MB budget. Dropping to
`-crf 34` would take the file to 818KB and the page to roughly 1.04MB at a
rendered difference of 0.64/255. Replacing the loop with a still frame would
put the page near 260KB. Both are your call — the site currently keeps the
motion the design was built around.

## Environment variables

Copy `.env.example` to `.env` for local work. Both variables also need setting
in Vercel, under **Project → Settings → Environment Variables**.

| Variable               | Environments                     | Value                          | Notes                                                                                                                                                            |
| ---------------------- | -------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_SITE_URL`      | Production                       | `https://wisdomska.vercel.app` | The canonical origin. Change this one value to move to a custom domain.                                                                                          |
| `PUBLIC_SITE_URL`      | Preview                          | leave unset                    | Preview builds inherit the production fallback; preview URLs are `noindex` by virtue of not being linked or in the sitemap.                                      |
| `PUBLIC_SITE_URL`      | Development                      | leave unset                    | Falls back to the production URL.                                                                                                                                |
| `PUBLIC_WEB3FORMS_KEY` | Production, Preview, Development | your Web3Forms access key      | **Public by design.** It authorises "deliver a message to the bound inbox" and nothing else. It lives in an env var so it can be rotated without editing markup. |

Get a Web3Forms key free at <https://web3forms.com> — enter the destination
email and it is sent to you. No account needed.

**No secret of any kind belongs in this repo.** There is no server, no
database, and no API key with write access to anything.

---

## Deploying

Vercel builds and deploys on every push. Nothing is deployed by hand.

- **Project name:** `wisdomska` — this is what produces the
  `wisdomska.vercel.app` subdomain, so it must not be renamed.
- **Production branch:** `main`.
- **Build command:** `npm run build`. **Output:** `dist`.
- Headers, redirects, caching and the Content-Security-Policy all live in
  `vercel.json`.

### Analytics

Vercel **Web Analytics** and **Speed Insights** are enabled from the project
dashboard (Analytics tab → Enable). Both are cookieless and collect no personal
data, so the site needs no consent banner.

They are injected **in production only** — `src/components/Analytics.astro`
checks `VERCEL_ENV`, so preview deploys and local development report nothing.

On the Hobby plan Web Analytics is free with a monthly event cap and about a
month of retention, which is comfortably enough for a portfolio. If you ever
outgrow it, the alternatives that keep the no-cookie, no-banner property are
[Plausible](https://plausible.io) (paid, hosted) or a self-hosted
[Umami](https://umami.is) — both would be a one-component change here.

---

## Branching and pull requests

```
feature branch  →  pull request  →  Vercel preview  →  merge to main  →  production
```

- `main` is the production branch and is protected: it requires a passing CI
  check and a pull request. Do not push to it directly, and never force-push.
- `develop` is the long-running integration branch. Branch from it for work
  that is not ready to ship.
- Every pull request gets its own Vercel preview URL, posted as a comment.
  Open it and click through before merging.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org):
  `feat:`, `fix:`, `perf:`, `docs:`, `chore:`, `ci:`.

### What CI checks

On every pull request and every push to `main`, in one job under five minutes:

Prettier → ESLint → Stylelint → Astro type check → build (any build warning
fails the run) → HTML validation → pa11y with axe and HTML CodeSniffer on
seven routes → broken-link crawl → Lighthouse CI.

Lighthouse budgets are asserted and will fail the build:
**Performance ≥ 95, Accessibility 100, Best Practices ≥ 95, SEO 100.**

---

## Budgets

| Metric                            | Budget         |
| --------------------------------- | -------------- |
| LCP (simulated 4G mobile)         | < 2.0s         |
| CLS                               | < 0.05         |
| INP                               | < 200ms        |
| Home page transferred             | < 1MB          |
| JavaScript                        | < 50KB gzipped |
| Console errors or warnings        | zero           |
| Horizontal overflow, 320px–2560px | zero           |
| `!important` in shipped CSS       | zero           |

---

## Pointing a custom domain at the site

`https://wisdomska.vercel.app` is canonical today. This is the whole procedure
for moving to your own domain — nothing here needs doing until you buy one.

### 1. Decide which host is canonical

Pick **one** and redirect the other. Either works; `www` is marginally easier
because it can be a `CNAME`, which survives Vercel changing IP addresses.

- Apex canonical: `senya.com` is the real site, `www.senya.com` redirects to it.
- `www` canonical: `www.senya.com` is the real site, `senya.com` redirects.

### 2. Add both domains in Vercel

**Project `wisdomska` → Settings → Domains → Add.** Add the apex and the `www`
host. Vercel will mark one as the primary and offer to redirect the other —
accept that, and it handles the redirect for you. Vercel then shows the exact
records to create.

### 3. Create the DNS records at your registrar

| Host  | Type    | Name  | Value                  |
| ----- | ------- | ----- | ---------------------- |
| Apex  | `A`     | `@`   | `76.76.21.21`          |
| `www` | `CNAME` | `www` | `cname.vercel-dns.com` |

Use the values Vercel shows you rather than the ones above if they differ —
Vercel publishes the current target in the Domains panel.

Delete any existing `A`, `AAAA` or `CNAME` records for the same names first,
including parking-page records the registrar added at purchase. Leave `MX`
records alone or you will break your email.

### 4. If your DNS is on Cloudflare

Two things differ:

- **Set the proxy status to "DNS only" (grey cloud), not "Proxied" (orange).**
  Proxying puts Cloudflare in front of Vercel, which breaks Vercel's
  certificate issuance and double-caches the site.
- **Set SSL/TLS encryption mode to "Full (strict)".** "Flexible" causes a
  redirect loop.

Cloudflare also supports `CNAME` at the apex through CNAME flattening, so you
may use a `CNAME` to `cname.vercel-dns.com` for `@` instead of the `A` record.

### 5. Wait for propagation

Usually 5–30 minutes. It can take up to 48 hours if the domain previously had
records with a long TTL. Lower the TTL to 300 seconds a day before you switch
if you want it fast. Check with:

```bash
dig +short senya.com
dig +short www.senya.com
```

### 6. Confirm HTTPS

Vercel issues a Let's Encrypt certificate automatically once DNS resolves —
usually within a minute or two of propagation. The Domains panel shows a
padlock and "Valid Configuration" when it is done. Then check:

```bash
curl -sSI https://senya.com | head -1
curl -sSI https://www.senya.com | head -1
```

You should see `200` on the canonical host and `308` on the other.

### 7. Switch the site over

**Change `PUBLIC_SITE_URL` in the Vercel dashboard to `https://senya.com` and
redeploy. That is the only change.**

Canonical tags, `og:url`, the sitemap, `robots.txt`, the JSON-LD and the share
card URLs are all derived from that one value through `SITE_URL` in
`src/data/site.ts`. No file in this repository contains the string
`wisdomska.vercel.app` except `.env.example` and this README.

If you would rather bake it in than set an environment variable, change the
fallback on line 12 of `src/data/site.ts` and the matching fallback in
`astro.config.mjs` — Astro needs the origin at config time, before the module
graph exists, which is the one place the value is repeated.

Afterwards, keep `wisdomska.vercel.app` attached to the project. Vercel will
redirect it to the new canonical host, so existing links keep working.

---

## Licence

Code is MIT. The design, written content, imagery and case studies are **not**
licensed for reuse. See [LICENSE](LICENSE).
