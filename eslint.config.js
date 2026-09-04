import js from '@eslint/js';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', '.vercel/**'] },

  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,

  {
    files: ['**/*.{js,mjs,ts,astro}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // The DOM queries in src/scripts are guarded before use; the non-null
      // assertions that remain are on elements the component always renders.
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  {
    // Build scripts are Node CLIs and are expected to log.
    files: ['scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
];
