/**
 * Render the 1200x630 share cards into public/og/.
 *
 * One card per route, in the site's own language: near-black ground, the
 * magenta->purple rule, the brand mark, and NHD set large. A new case study
 * gets a card automatically — the list is read from the content collection,
 * not maintained by hand.
 *
 * Run with: npm run og
 *
 * Needs the licensed originals in src-fonts/ (see README, "Fonts"), because
 * Satori embeds real glyph outlines rather than relying on system fonts. The
 * rendered PNGs are committed, so a normal build and CI never run this.
 */
import satori from 'satori';
import sharp from 'sharp';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const OUT = 'public/og';
const W = 1200;
const H = 630;

const C = {
  bg: '#111111',
  text: '#ffffff',
  dim: '#8f8f8f',
  mid: '#d8d8d8',
};

/* ------------------------------------------------------------------- fonts */

const FONT_DIR = 'src-fonts';
if (!existsSync(`${FONT_DIR}/NHD-Bold.ttf`)) {
  console.error(
    `\n  ${FONT_DIR}/NHD-Bold.ttf not found.\n\n` +
      '  Share cards need the licensed font originals, which are not committed.\n' +
      '  The rendered cards in public/og are committed instead, so you only need\n' +
      '  this when adding a case study. See the README, "Fonts".\n'
  );
  process.exit(1);
}

const fonts = [
  { name: 'NHD', data: await readFile(`${FONT_DIR}/NHD-Roman.ttf`), weight: 400, style: 'normal' },
  { name: 'NHD', data: await readFile(`${FONT_DIR}/NHD-Bold.ttf`), weight: 700, style: 'normal' },
];

const markData = `data:image/png;base64,${(
  await sharp('src/assets/brand/mark.png').resize(96, 96).png().toBuffer()
).toString('base64')}`;

/* -------------------------------------------------------------- the layout */

const el = (type, props, ...children) => ({
  type,
  props: {
    ...props,
    children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children,
  },
});

function card({ title, kicker, meta }) {
  return el(
    'div',
    {
      style: {
        width: W,
        height: H,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: C.bg,
        fontFamily: 'NHD',
        padding: '64px 72px',
        position: 'relative',
      },
    },
    // The brand rule, as it runs across the top of every page.
    el('div', {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: W,
        height: 8,
        background: 'linear-gradient(95deg, #cb7ffe 0%, #e0479f 55%, #ff1043 100%)',
      },
    }),
    // Magenta bloom, echoing the footer.
    el('div', {
      style: {
        position: 'absolute',
        right: -160,
        top: -160,
        width: 720,
        height: 720,
        borderRadius: 720,
        background:
          'radial-gradient(circle at center, rgba(155,60,190,0.30) 0%, rgba(17,17,17,0) 68%)',
      },
    }),

    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 20 } },
      el('img', { src: markData, width: 72, height: 72, style: { borderRadius: 14 } }),
      el(
        'div',
        { style: { display: 'flex', fontSize: 26, color: C.dim, letterSpacing: '0.14em' } },
        "SENYA'S PORTFOLIO"
      )
    ),

    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
      el(
        'div',
        {
          style: {
            display: 'flex',
            fontSize: title.length > 26 ? 76 : 104,
            fontWeight: 700,
            color: C.text,
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
          },
        },
        title
      ),
      kicker &&
        el(
          'div',
          {
            style: { display: 'flex', fontSize: 30, color: C.mid, lineHeight: 1.3, maxWidth: 900 },
          },
          kicker
        )
    ),

    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 18, fontSize: 24, color: C.dim } },
      el('div', { style: { display: 'flex' } }, meta)
    )
  );
}

async function write(name, spec) {
  const svg = await satori(card(spec), { width: W, height: H, fonts });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(path.join(OUT, `${name}.png`), png);
  console.log(`  ok    ${name}.png  ${(png.length / 1024).toFixed(0)}KB`);
}

/* --------------------------------------------------------------- the cards */

await mkdir(OUT, { recursive: true });

const OWNER = 'UI/UX & Graphic Designer · Accra, Ghana';

await write('default', {
  title: 'Senya',
  kicker: 'UI/UX and graphic design — websites, web apps and mobile products.',
  meta: OWNER,
});

await write('home', {
  title: 'UI/UX & Graphic Designer',
  kicker: '3+ years turning ideas into products people enjoy using.',
  meta: OWNER,
});

await write('projects', {
  title: 'Projects',
  kicker: 'Thirteen case studies across mobile, web and internal tools.',
  meta: OWNER,
});

await write('contact', {
  title: 'Contact',
  kicker: "Have a project in mind? I'd love to hear about it.",
  meta: OWNER,
});

// One card per case study, driven by the markdown front matter.
const dir = 'src/content/projects';
for (const file of (await readdir(dir)).filter((f) => f.endsWith('.md'))) {
  const { data } = matter(await readFile(path.join(dir, file), 'utf8'));
  await write(file.replace(/\.md$/, ''), {
    title: data.title,
    kicker: data.tagline,
    meta: [data.service, data.year].filter(Boolean).join(' · '),
  });
}
