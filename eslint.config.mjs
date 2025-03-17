import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import pluginCypress from 'eslint-plugin-cypress/flat';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import jestDomPlugin from 'eslint-plugin-jest-dom';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';
import { config as tslintConfig, configs as tslintConfigs } from 'typescript-eslint';

export default tslintConfig(
  {
    ignores: ['dist/**'],
  },
  eslint.configs.recommended,
  tslintConfigs.recommended,
  pluginCypress.configs.recommended,
  jestDomPlugin.configs['flat/recommended'],
  jestPlugin.configs['flat/recommended'],
  jestPlugin.configs['flat/style'],
  eslintConfigPrettier,
  {
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    ...importPlugin.flatConfigs.recommended,
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
      'import/prefer-default-export': 'error',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.ts',
            'server/test-utils/**',
            'cypress.config.ts',
            'eslint.config.mjs',
            'esbuild/**',
          ],
        },
      ],
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
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
