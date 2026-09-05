/**
 * Build invariants, checked against the CSS that actually ships.
 *
 * Every regression this guards against was invisible in the source and
 * invisible to getComputedStyle in a Chromium test — the only place they
 * showed up was the bundled stylesheet, and by then they were live.
 *
 *  - Lightning CSS treats `backdrop-filter` and `-webkit-backdrop-filter` in
 *    one block as duplicates and keeps only the last, which silently deleted
 *    every standard declaration. Firefox supports only the unprefixed
 *    property, so the glass panels lost their blur entirely.
 *  - Stylelint's --fix has previously stripped `-webkit-background-clip`,
 *    which would flatten the gradient headings to solid white in Safari.
 *
 * Both are the same shape of failure: one half of a prefix pair disappearing
 * entirely. So the rule is that neither half may reach zero while the other
 * is still in use.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Defaults to the build output; an explicit path makes the checks themselves
// testable against a deliberately broken fixture.
const DIST = process.argv[2] ?? 'dist';

/** Every .css file under dist/, at any depth. */
function stylesheets(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...stylesheets(path));
    else if (entry.endsWith('.css')) out.push(path);
  }
  return out;
}

/**
 * Count declarations of `property`, ignoring any that are only the tail of a
 * vendor-prefixed name. A declaration starts after `{`, `;` or whitespace.
 */
function countProperty(css, property) {
  const matches = css.match(new RegExp(`(^|[{;\\s])${property}\\s*:`, 'g'));
  return matches ? matches.length : 0;
}

/**
 * Pairs that must survive the bundler together. `standard` is what
 * non-WebKit engines need; `prefixed` is what older WebKit needs. If either
 * side is dropped, one family of browsers loses the effect with no error.
 */
const PAIRS = [
  { standard: 'backdrop-filter', prefixed: '-webkit-backdrop-filter' },
  { standard: 'background-clip', prefixed: '-webkit-background-clip' },
];

const files = stylesheets(DIST);
const failures = [];

if (files.length === 0) {
  failures.push(`No stylesheets found under ${DIST}/ — did the build run?`);
}

const css = files.map((f) => readFileSync(f, 'utf8')).join('\n');

for (const { standard, prefixed } of PAIRS) {
  const standardCount = countProperty(css, standard);
  const prefixedCount = countProperty(css, prefixed);

  if (standardCount === 0 && prefixedCount === 0) continue; // Not used at all.

  // Counts are deliberately not compared for equality: one grouped selector
  // list can serve many rules, so the two sides legitimately differ. What must
  // never happen is either side reaching zero while the other is in use.
  if (standardCount === 0) {
    failures.push(
      `${standard}: 0 declarations shipped, but ${prefixedCount} of ${prefixed}. ` +
        `Engines without the -webkit- alias (Firefox) lose the effect entirely.`
    );
  } else if (prefixedCount === 0) {
    failures.push(
      `${prefixed}: 0 declarations shipped, but ${standardCount} of ${standard}. ` +
        `WebKit versions that only accept the prefixed name lose the effect.`
    );
  }
}

// The cascade is settled by @layer order. An !important means a layer boundary
// has been worked around rather than fixed, so it should never appear.
const bangs = (css.match(/!\s*important/g) ?? []).length;
if (bangs > 0) {
  failures.push(
    `${bangs} !important declaration(s) in the shipped CSS; the @layer order should make them unnecessary.`
  );
}

if (failures.length > 0) {
  console.error(`\nBuild verification failed (${files.length} stylesheet(s) checked):\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  console.error('');
  process.exit(1);
}

console.log(`Build verification passed — ${files.length} stylesheet(s) checked.`);
for (const { standard, prefixed } of PAIRS) {
  const n = countProperty(css, standard);
  if (n > 0)
    console.log(
      `  ✓ ${standard} (${n}) and ${prefixed} (${countProperty(css, prefixed)}) both present`
    );
}
console.log('  ✓ no !important');
