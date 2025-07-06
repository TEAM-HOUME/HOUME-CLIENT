// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['dist', 'node_modules/', '*.js', '*.d.ts'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: typescriptParser,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      '@tanstack/query': tanstackQueryPlugin,
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // 기본 ESLint 규칙
      ...js.configs.recommended.rules,
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      ...reactHooks.configs.recommended.rules, // React Hooks 규칙
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      'react/react-in-jsx-scope': 'off', // React 17+에서는 React import 필요 없음
      '@typescript-eslint/explicit-function-return-type': 'off', // 함수 반환 타입 명시 필요 없음
      '@typescript-eslint/naming-convention': 'off', // 명명 규칙 강제하지 않음
      '@typescript-eslint/no-floating-promises': 'off', // 처리되지 않은 Promises 경고 무시
      '@typescript-eslint/strict-boolean-expressions': 'off', // 엄격한 boolean 표현 사용 X
      '@typescript-eslint/no-confusing-void-expression': 'off', // void 표현 규칙 무시
      '@typescript-eslint/no-unused-vars': 'warn', // 사용되지 않는 변수 경고
      '@tanstack/query/exhaustive-deps': 'error', // 의존성 배열이 완전한지 검사
      '@tanstack/query/no-rest-destructuring': 'warn', // REST 매개변수 해체 사용 경고
      '@tanstack/query/stable-query-client': 'error', // 안정적인 쿼리 클라이언트 사용 강제
      // 'prettier/prettier': 'error', // Prettier 규칙 적용
      // import 순서 규칙
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          pathGroups: [
            { pattern: 'react', group: 'builtin', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'never', // Import 사이에 새로운 줄 없음
        },
      ],
    },
  },
  eslintConfigPrettier,
  ...storybook.configs['flat/recommended'],
];
