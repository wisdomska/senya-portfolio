/**
 * Build the favicon set from the brand mark.
 *
 * The mark is the leading 1024x1024 square of the SENYA logo lockup — the
 * chrome-and-magenta "S" — so nothing here is newly drawn.
 *
 * Run with: npm run icons
 */
import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';

const SRC = 'src/assets/brand/mark.png';
const OUT = 'public';
const BG = '#111111';

/** PNG sizes written straight into public/. */
const PNGS = [
  { file: 'apple-touch-icon.png', size: 180, flatten: true },
  { file: 'icon-192.png', size: 192, flatten: false },
  { file: 'icon-512.png', size: 512, flatten: false },
];

const render = (size, flatten) => {
  let p = sharp(SRC).resize(size, size, {
    fit: 'contain',
    background: flatten ? BG : { r: 0, g: 0, b: 0, alpha: 0 },
  });
  if (flatten) p = p.flatten({ background: BG });
  return p.png({ compressionLevel: 9 }).toBuffer();
};

/**
 * Minimal .ico writer. ICO has allowed PNG payloads since Windows Vista, so
 * each entry is just a PNG with a 16-byte directory record in front of it —
 * no dependency needed.
 */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const dir = [];
  for (const { size, png } of entries) {
    const rec = Buffer.alloc(16);
    rec.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 means 256)
    rec.writeUInt8(size >= 256 ? 0 : size, 1); // height
    rec.writeUInt8(0, 2); // palette size
    rec.writeUInt8(0, 3); // reserved
    rec.writeUInt16LE(1, 4); // colour planes
    rec.writeUInt16LE(32, 6); // bits per pixel
    rec.writeUInt32LE(png.length, 8);
    rec.writeUInt32LE(offset, 12);
    dir.push(rec);
    offset += png.length;
  }

  return Buffer.concat([header, ...dir, ...entries.map((e) => e.png)]);
}

await mkdir(OUT, { recursive: true });

for (const { file, size, flatten } of PNGS) {
  await writeFile(`${OUT}/${file}`, await render(size, flatten));
  console.log(`  ok    ${file} (${size}x${size})`);
}

// favicon.ico carries 16/32/48 so Windows picks the right one per context.
const ico = buildIco(
  await Promise.all([16, 32, 48].map(async (size) => ({ size, png: await render(size, true) })))
);
await writeFile(`${OUT}/favicon.ico`, ico);
console.log(`  ok    favicon.ico (16/32/48)`);

// favicon.svg wraps the mark so browsers that prefer SVG get a container that
// scales cleanly. The mark itself is a raster brand asset, so it is embedded
// rather than redrawn — redrawing it would change the design.
const inline = (await render(96, true)).toString('base64');
await writeFile(
  `${OUT}/favicon.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">` +
    `<title>Senya</title>` +
    `<image href="data:image/png;base64,${inline}" width="96" height="96"/>` +
    `</svg>\n`
);
console.log('  ok    favicon.svg');
