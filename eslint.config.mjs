// eslint-plugin-import disabled due to minimatch v10 incompatibility (GHSA-3ppc-4f35-3m26)
// Uncomment when https://github.com/eslint/eslint/issues/20508 is resolved
// import importPlugin from 'eslint-plugin-import';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import jestPlugin from 'eslint-plugin-jest';
import jestDomPlugin from 'eslint-plugin-jest-dom';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';
import { config as tslintConfig, configs as tslintConfigs } from 'typescript-eslint';

export default tslintConfig(
  {
    ignores: ['dist/**', 'scripts/**', 'server/__tests__/scripts/**', 'playwright-report/**', 'test-results/**'],
  },
  eslint.configs.recommended,
  tslintConfigs.recommended,
  jestDomPlugin.configs['flat/recommended'],
  jestPlugin.configs['flat/recommended'],
  jestPlugin.configs['flat/style'],
  eslintConfigPrettier,
  // {
  //   settings: {
  //     'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
  //     'import/resolver': { typescript: { alwaysTryTypes: true } },
  //   },
  //   ...importPlugin.flatConfigs.recommended,
  // },
  {
    files: ['assets/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      'unused-imports': unusedImportsPlugin,
      'no-only-tests': noOnlyTests,
    },
    rules: {
      // 'import/prefer-default-export': 'error',
      // 'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.ts', 'server/test-utils/**', 'eslint.config.mjs', 'esbuild/**', 'playwright.config.ts', 'e2e-tests/**'] }],
      // 'import/order': ['error', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-only-tests/no-only-tests': 'error',
      'jest/valid-title': 'off',
      'jest/expect-expect': 'off',
    },
  },
);
