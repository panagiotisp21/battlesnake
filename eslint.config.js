import globals from 'globals';
import pluginJs from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest'; // Import the plugin

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'module' },
  },
  {
    languageOptions: { globals: globals.node },
  },
  pluginJs.configs.recommended,

  // --- JEST CONFIGURATION BLOCK ---
  {
    files: ['**/*.test.js', '**/*.spec.js'], // Target test files
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: jestPlugin.environments.globals.jest,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
];
