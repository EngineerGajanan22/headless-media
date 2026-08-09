/**
 * ESLint boundary enforcement for @headless-media/ui-react.
 *
 * This is Wall 2 — even if somehow TypeScript missed it, ESLint will
 * surface a clear error message explaining why the import is wrong.
 */

/** @type {import('eslint').Linter.Config} */
const base = require('../../.eslintrc.base.js');

module.exports = {
  ...base,
  rules: {
    ...base.rules,
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@headless-media/core', 'media-core'],
            message:
              '@headless-media/ui-react is a headless UI library. ' +
              'It must not import SDK packages. Pass all data as props.',
          },
          {
            group: ['@headless-media/react', 'media-react'],
            message:
              '@headless-media/ui-react must not import framework wrappers. ' +
              'The app layer is responsible for connecting wrappers to UI.',
          },
          {
            group: ['@headless-media/native', 'media-native'],
            message:
              '@headless-media/ui-react must not import platform wrappers.',
          },
        ],
      },
    ],
  },
};
