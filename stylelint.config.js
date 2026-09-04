/** @type {import('stylelint').Config} */
export default {
  extends: 'stylelint-config-standard',
  ignoreFiles: ['dist/**', '.astro/**', 'node_modules/**'],
  rules: {
    'custom-property-pattern': null,
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'media-feature-range-notation': null,
    'declaration-block-no-redundant-longhand-properties': null,

    // Colour and length notation is left exactly as authored in the export,
    // so this CSS stays diffable against the original design.
    'color-hex-length': null,
    'color-function-notation': null,
    'color-function-alias-notation': null,
    'alpha-value-notation': null,
    'shorthand-property-no-redundant-values': null,

    // -webkit-background-clip and -webkit-backdrop-filter are still required
    // by Safari, and -webkit-mask-composite: xor has no unprefixed equivalent
    // Safari accepts. Stylelint's autofix strips these, which silently breaks
    // the gradient type and every glass panel on the site.
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'declaration-block-no-duplicate-properties': [
      true,
      { ignore: ['consecutive-duplicates-with-different-values'] },
    ],
    'declaration-property-value-no-unknown': [
      true,
      { ignoreProperties: { 'mask-composite': ['xor'] } },
    ],

    // senyaTicker is referenced by name from the marquee component.
    'keyframes-name-pattern': null,
  },
};
