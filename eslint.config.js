import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import typescriptParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import prettierPlugin from 'eslint-plugin-prettier';
import vanillaExtract from '@antebudimir/eslint-plugin-vanilla-extract';

/**
 * `@shared/` 아래에 더 짧은 alias가 있는 폴더.
 * 같은 파일을 두 경로로 import하면 사용처를 grep으로 찾을 때 검색을 두 번 해야 하고 하나를 놓친다.
 */
const SHORTER_ALIAS_TARGETS = [
  'analytics',
  'apis',
  'assets',
  'components',
  'constants',
  'hooks',
  'styles',
  'utils',
];

/** src/pages 바로 아래 화면 폴더. 서로 직접 import하지 않는다 */
const PAGE_DIRS = [
  'banner',
  'generate',
  'home',
  'imageSetup',
  'landing',
  'login',
  'mypage',
  'notFound',
  'signup',
  'style',
];

/**
 * 화면끼리 직접 참조하면 한쪽을 고칠 때 다른 쪽이 함께 깨지고, 삭제할 때 무엇이 딸려 있는지 알 수 없다.
 * 두 화면 이상이 쓰는 코드는 shared/로 올린다 (docs/conventions.md "공유 코드 배치 기준").
 */
const crossPageZones = PAGE_DIRS.map((dir) => ({
  target: `./src/pages/${dir}`,
  from: './src/pages',
  except: [`./${dir}`],
  message:
    '화면끼리 직접 import하지 않습니다. 두 화면 이상이 쓰면 shared/로 올리세요 (docs/conventions.md)',
}));

export default [
  {
    ignores: [
      'dist',
      'node_modules/',
      '*.js',
      '*.d.ts',
      'src/shared/apis/__generated__/**',
      '.agents/**', // Claude Code 스킬 예제 — 앱 코드 아님
      'vite.config.local.ts', // gitignore된 로컬 전용 파일 — tsconfig에 없음
    ],
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
      // tsconfig의 paths(alias)를 import 규칙이 실제 파일로 풀어낼 수 있게 한다
      'import/resolver': {
        typescript: {
          project: './tsconfig.app.json',
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      '@tanstack/query': tanstackQueryPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // 기본 ESLint 규칙
      ...js.configs.recommended.rules,
      // JSX 규칙 (key 누락, children prop 오용, 잘못된 DOM 속성 등)
      ...reactPlugin.configs.flat.recommended.rules,
      'no-undef': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      ...reactHooks.configs.recommended.rules, // React Hooks 규칙
      // deps 누락은 오래된 값을 읽는 버그로 이어지므로 경고가 아니라 에러로 막는다.
      // 규칙대로 못 고치는 경우(언마운트 정리에서 최신 ref를 읽어야 하는 등)는
      // eslint-disable에 이유를 적어 남긴다 — 이유 없는 disable은 리뷰에서 거른다
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      'react/react-in-jsx-scope': 'off', // React 17+에서는 React import 필요 없음
      '@typescript-eslint/explicit-function-return-type': 'off', // 함수 반환 타입 명시 필요 없음
      '@typescript-eslint/naming-convention': 'off', // 명명 규칙 강제하지 않음
      '@typescript-eslint/strict-boolean-expressions': 'off', // 엄격한 boolean 표현 사용 X
      '@typescript-eslint/no-confusing-void-expression': 'off', // void 표현 규칙 무시
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ], // 사용되지 않는 변수 경고 (_prefix 무시)

      '@tanstack/query/exhaustive-deps': 'error', // 의존성 배열이 완전한지 검사
      '@tanstack/query/no-rest-destructuring': 'warn', // REST 매개변수 해체 사용 경고
      '@tanstack/query/stable-query-client': 'error', // 안정적인 쿼리 클라이언트 사용 강제

      // 경로 표기 규칙 — 같은 파일이 두 경로로 불리면 grep 검색이 샌다
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*', '@/**'],
              message:
                '@/ prefix는 쓰지 않습니다. 가장 짧은 alias를 쓰세요 (@routes/, @apis/, @components/ ...). docs/conventions.md',
            },
            {
              group: SHORTER_ALIAS_TARGETS.flatMap((dir) => [
                `@shared/${dir}`,
                `@shared/${dir}/**`,
              ]),
              message:
                '더 짧은 alias가 있습니다. @shared/apis → @apis, @shared/hooks → @hooks 처럼 최단 경로를 쓰세요. docs/conventions.md',
            },
            {
              group: ['../../../*', '../../../**', '../../../../**'],
              message:
                '3단계 이상 올라가는 상대경로는 쓰지 않습니다. 파일을 옮겨도 깨지지 않도록 alias를 쓰세요. docs/conventions.md',
            },
            {
              group: ['**/index', '**/index.ts', '**/index.tsx'],
              message:
                'barrel(index) 경유 import를 하지 않습니다. 실제 파일 경로를 직접 import하세요. docs/conventions.md',
            },
          ],
        },
      ],

      // 의존 방향 규칙 — 공용 코드가 화면을 알면 화면을 지울 때 공용 코드가 깨진다
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/shared',
              from: './src/pages',
              message:
                'shared/는 pages/를 import할 수 없습니다. 조립이 필요하면 진입점(main.tsx)이나 routes/에서 하세요. docs/conventions.md',
            },
            {
              target: './src/store',
              from: './src/pages',
              message:
                'store/는 pages/를 import할 수 없습니다. docs/conventions.md',
            },
            ...crossPageZones,
          ],
        },
      ],

      // import 순서 규칙
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
            'object',
          ],
          pathGroups: [
            // react를 external 최상단에
            { pattern: 'react', group: 'external', position: 'before' },

            // path alias를 internal로 분류
            { pattern: '@pages/**', group: 'internal', position: 'before' },
            { pattern: '@routes/**', group: 'internal', position: 'before' },
            { pattern: '@store/**', group: 'internal', position: 'before' },
            { pattern: '@shared/**', group: 'internal', position: 'before' },
            { pattern: '@analytics/**', group: 'internal', position: 'before' },
            { pattern: '@apis/**', group: 'internal', position: 'before' },
            { pattern: '@assets/**', group: 'internal', position: 'before' },
            {
              pattern: '@components/**',
              group: 'internal',
              position: 'before',
            },
            { pattern: '@constants/**', group: 'internal', position: 'before' },
            { pattern: '@hooks/**', group: 'internal', position: 'before' },
            { pattern: '@styles/**', group: 'internal', position: 'before' },
            // @types는 npm @types 스코프와 충돌 → @shared/types/ 사용
            { pattern: '@utils/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['react'],

          // 그룹 사이 빈줄
          'newlines-between': 'always',

          // 그룹 내 알파벳 정렬
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  /**
   * 타입 정보를 읽는 규칙 — typescript-eslint 표준 프리셋 `recommendedTypeChecked`.
   *
   * 규칙을 하나하나 고르지 않고 프리셋을 기준으로 둔다. 하우미에서 다르게 가는 것만
   * 아래에 이유와 함께 적는다. 개별 규칙 설명은 typescript-eslint.io/rules/{규칙명}.
   *
   * `projectService: true`가 있어야 타입 정보를 읽는다. src 전체 린트 약 7초.
   *
   * 상위 프리셋 strictTypeChecked는 채택 X — 위반 234건이고 그중
   * no-non-null-assertion 38건은 하우미가 쓰는 `!` 표기와 정면으로 충돌한다.
   */
  ...tseslint.configs.recommendedTypeChecked.map((c) =>
    c.files ? c : { ...c, files: ['**/*.{ts,tsx}'] }
  ),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /* --- 프리셋에서 끄는 것 --- */

      // '이 요청이 실패하면 사용자에게 보여줄 것인가'를 건별로 정해야 고칠 수 있다.
      // 에러 처리 정책(docs/conventions.md)에서 정한 뒤 켠다. 지금 켜면 판단 없이 void만 붙이게 되어 규칙이 무력화된다. 2026-08 기준 84건 / 27건
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',

      /* --- 프리셋에서 완화하는 것 --- */

      // react-router는 라우트에서 `throw new Response(..., { status })`로  404 등을 errorElement에 넘긴다. 이 패턴만 예외로 둔다
      '@typescript-eslint/only-throw-error': [
        'error',
        { allow: [{ from: 'lib', name: 'Response' }] },
      ],
      // 기존 규약 유지: _ prefix는 미사용 허용
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      /* --- 프리셋에 없지만 추가로 켜는 것 ---
         전부 도입 당시 실제 위반이 있었던 것 (대부분 --fix로 처리) */

      '@typescript-eslint/non-nullable-type-assertion-style': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      /* --- 추가하지 않기로 한 것 ---
         no-unnecessary-condition: 서버 생성 타입(__generated__)이 실제보다 낙관적이라 (nullable이어야 할 필드가 non-nullable) 실제로 필요한 방어 코드를 지우도록 강제한다 */
    },
  },
  // barrel 파일 금지 — 사용처 grep이 배럴에서 끊기고, 순환 참조를 만든다.
  // 2026-08 기준 src 아래 index.ts는 0개다. 다시 생기지 않도록 파일 존재 자체를 막는다.
  {
    files: ['src/**/index.ts', 'src/**/index.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program',
          message:
            'barrel 파일(index.ts)을 만들지 않습니다. 각 파일을 직접 import하세요. docs/conventions.md',
        },
      ],
    },
  },
  // Vanilla Extract CSS 속성 정렬 + 스타일 검증
  {
    files: ['**/*.css.ts'],
    plugins: {
      'vanilla-extract': vanillaExtract,
    },
    rules: {
      'vanilla-extract/concentric-order': 'error',
      'vanilla-extract/no-empty-style-blocks': 'off',
      'vanilla-extract/no-trailing-zero': 'error',
      'vanilla-extract/no-zero-unit': 'off',
      'vanilla-extract/no-unknown-unit': 'error',
      'vanilla-extract/no-unitless-values': 'error',
    },
  },
  eslintConfigPrettier,
];
