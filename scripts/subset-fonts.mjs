/**
 * Convert the licensed TTF/OTF originals in src-fonts/ into subset WOFF2 files
 * in public/fonts/, and print the @font-face metric overrides that keep the
 * Arial fallback from shifting the layout when the real face swaps in.
 *
 * Run with: npm run fonts
 *
 * The originals are NOT committed — see README, "Fonts". Drop the licensed
 * files into src-fonts/ and re-run this if you ever need to regenerate.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import subsetFont from 'subset-font';
import * as fontkit from 'fontkit';

const SRC = 'src-fonts';
const OUT = 'public/fonts';

/* --------------------------------------------------------------- glyph sets */

const LATIN =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`' +
  'abcdefghijklmnopqrstuvwxyz{|}~' +
  // Punctuation and symbols this site actually sets: curly quotes, en/em
  // dashes, ellipsis, middot, copyright, arrow, plus accented Latin-1 for
  // names and place names.
  ' ©«»·‐–—‘’“”…→éèêë' +
  'àâäçîïôöùûüÉÈÀÇ';

/**
 * The display face is used for exactly six strings on the whole site, all of
 * them set in mixed case. Subsetting to their glyphs alone takes it from
 * 75KB to a few KB. Update this if a new display heading is added.
 */
const DISPLAY_STRINGS = [
  'feaTUrEd worKS',
  'Meet Senya',
  'CArEEr',
  'hAlL of FamE',
  'DesignEr',
  'LINKS',
];
const DISPLAY = [...new Set(DISPLAY_STRINGS.join('').split(''))].join('');

/* ---------------------------------------------------------------- the faces */

const FACES = [
  { file: 'NHD-Light.ttf', out: 'nhd-light.woff2', chars: LATIN },
  { file: 'NHD-Roman.ttf', out: 'nhd-roman.woff2', chars: LATIN, metrics: true },
  { file: 'NHD-Medium.ttf', out: 'nhd-medium.woff2', chars: LATIN },
  { file: 'NHD-Bold.ttf', out: 'nhd-bold.woff2', chars: LATIN },
  { file: 'NHD-RomanItalic.ttf', out: 'nhd-roman-italic.woff2', chars: LATIN },
  { file: 'NHD-MediumItalic.ttf', out: 'nhd-medium-italic.woff2', chars: LATIN },
  { file: 'DigitalCards.otf', out: 'digitalcards.woff2', chars: DISPLAY },
];

/* Arial's metrics, the fallback we adjust towards. */
const ARIAL = { unitsPerEm: 2048, ascent: 1854, descent: -434, avgWidth: 1139 };

/** Mean advance width across a-z A-Z 0-9 and space, in em units. */
function averageWidth(font) {
  const sample = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
  const run = font.layout(sample);
  const total = run.glyphs.reduce((sum, g) => sum + g.advanceWidth, 0);
  return total / run.glyphs.length / font.unitsPerEm;
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(
      `\n  ${SRC}/ not found.\n\n` +
        '  Font sources are not committed (licensed faces). Put the original\n' +
        '  .ttf/.otf files there and run `npm run fonts` again. See the README.\n'
    );
    process.exitCode = 1;
    return;
  }

  await mkdir(OUT, { recursive: true });
  const present = new Set(await readdir(SRC));
  let overrides = '';

  for (const face of FACES) {
    if (!present.has(face.file)) {
      console.warn(`  skip  ${face.file} (not in ${SRC}/)`);
      continue;
    }

    const buffer = await readFile(path.join(SRC, face.file));
    const woff2 = await subsetFont(buffer, face.chars, { targetFormat: 'woff2' });
    await writeFile(path.join(OUT, face.out), woff2);

    const kb = (n) => `${(n / 1024).toFixed(1)}KB`;
    console.log(`  ok    ${face.file} -> ${face.out}  ${kb(buffer.length)} -> ${kb(woff2.length)}`);

    if (face.metrics) {
      const font = fontkit.create(buffer);
      const sizeAdjust = (averageWidth(font) / (ARIAL.avgWidth / ARIAL.unitsPerEm)) * 100;
      const scale = sizeAdjust / 100;
      overrides =
        `  size-adjust: ${sizeAdjust.toFixed(1)}%;\n` +
        `  ascent-override: ${((font.ascent / font.unitsPerEm / scale) * 100).toFixed(0)}%;\n` +
        `  descent-override: ${((Math.abs(font.descent) / font.unitsPerEm / scale) * 100).toFixed(0)}%;\n` +
        `  line-gap-override: 0%;`;
    }
  }

  if (overrides) {
    console.log(
      '\n  Fallback metrics — paste into the "NHD Fallback" @font-face\n' +
        '  in src/styles/base.css if these differ from what is there:\n\n' +
        overrides +
        '\n'
    );
  }
}

await main();
