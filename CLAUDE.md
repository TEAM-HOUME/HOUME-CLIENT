# CLAUDE.md

HOUME 프로젝트에서 작업할 때 참고하는 가이드입니다.

**컨벤션의 기준 원문은 [docs/conventions.md](docs/conventions.md)입니다.** 이 파일에는 매 작업에 필요한 것만 두고, 상세 규칙·예시·근거는 그 문서를 봅니다. 규칙이 바뀌면 conventions.md를 고치고, 이 파일은 요약이 어긋날 때만 고칩니다.

## 개발 명령어

```bash
pnpm dev              # 개발 서버 (HMR)
pnpm build            # 프로덕션 빌드 (tsc -b && vite build)
pnpm lint             # ESLint 검사
pnpm lint --fix       # ESLint 자동 수정
pnpm format           # Prettier 포맷팅
```

## 기술 스택

- **React 19** + TypeScript + Vite
- **Vanilla Extract** (zero-runtime CSS-in-JS) + 디자인 토큰
- **TanStack Query v5** (서버 상태) + **Zustand** (클라이언트 상태)
- **React Router DOM 7** (Data API, 객체 기반 라우트)
- **@use-funnel** (온보딩 퍼널) / **overlay-kit** (모달·시트)
- **pnpm** 패키지 매니저

## 프로젝트 구조

```
src/
├── pages/          # 화면 단위 (banner, generate, home, imageSetup, landing,
│                   #            login, mypage, notFound, signup, style)
├── shared/         # 공통 모듈
│   ├── analytics/  # GA 이벤트·파라미터
│   ├── apis/       # config(axios·queryClient·request) + 공유 queries·mutations
│   ├── components/ # 공통 UI
│   ├── config/     # Sentry·Clarity 초기화
│   ├── constants/  # queryKeys, API_ENDPOINT
│   ├── monitoring/ # 에러 분류·보고 정책
│   ├── styles/     # 디자인 토큰
│   └── types/ hooks/ utils/ assets/
├── store/          # 전역 Zustand 스토어
└── routes/         # 라우터, RootLayout, paths.ts
```

페이지 내부: `apis/queries/`, `apis/mutations/`, `components/`, `hooks/`, `stores/`, `types/`, `utils/`

## Path Alias

**가장 짧은 alias를 사용한다.**

| Alias      | 경로                 | Alias          | 경로                     |
| ---------- | -------------------- | -------------- | ------------------------ |
| `@pages/`  | `src/pages/`         | `@components/` | `src/shared/components/` |
| `@routes/` | `src/routes/`        | `@constants/`  | `src/shared/constants/`  |
| `@store/`  | `src/store/`         | `@hooks/`      | `src/shared/hooks/`      |
| `@shared/` | `src/shared/`        | `@styles/`     | `src/shared/styles/`     |
| `@apis/`   | `src/shared/apis/`   | `@utils/`      | `src/shared/utils/`      |
| `@assets/` | `src/shared/assets/` | `@analytics/`  | `src/shared/analytics/`  |

**금지**: `@/` prefix, `@types/` alias(npm 스코프 충돌), 3단계 이상 상대경로

## 작업 시 지켜야 할 것

규칙의 상세와 이유는 conventions.md에 있습니다. 여기는 체크리스트입니다.

**네이밍** — 폴더 camelCase / 컴포넌트 `PascalCase.tsx` / 스타일 `PascalCase.css.ts` / 페이지 `{Feature}Page` / 쿼리 훅 `use{Subject}Query` / mutation 훅 `use{Subject}Mutation` / API 함수 `{httpMethod}{Subject}` / 상수 UPPER_SNAKE_CASE

**Export** — 컴포넌트는 default, 훅·유틸·상수·타입은 named. barrel(index.ts)·mixed export 금지

**API** — 모든 호출은 `request<T>()` 경유(axiosInstance 직접 사용 금지). 쿼리 키는 `queryKeys` factory. 1파일 = 1 API 작업(bare 함수 + 훅 colocate). 활성 쿼리는 `isPending`, 조건부 쿼리(`enabled`)는 `isLoading`

**경로** — `navigate()`·`<Navigate>`는 `ROUTES` 상수(`@routes/paths`). 하드코딩 금지

**스타일** — 색상은 `colorVars`, 폰트는 `fontVars`(`...fontVars.font.body_r_14`). `#hex`·`rgba()` 하드코딩 금지, 예외는 conventions.md의 예외 표에 등록 후 사용

**경계** — 페이지끼리 직접 import 금지, `shared/`는 `pages/`를 import 금지. 두 페이지 이상이 쓰면 shared로 올린다

**Provider** — `src/main.tsx`에서만 추가

## 건드리면 안 되는 것

- **서버 API의 V2 표기** — `shared/apis/__generated__/data-contracts.ts`의 타입명, `/api/v2`·`/api/v4` URL 값은 서버 유래

## Git 워크플로우

- 브랜치: `develop`에서 분기 → `develop`으로 merge
- 브랜치 이름: `type/description/#issue-number` (예: `feat/login-page/#12`)
- 커밋: `type: 제목` (한국어). types: `feat` `fix` `refactor` `style` `design` `chore` `docs` `test` `rename` `remove`
- PR: 리뷰어 2명 이상 승인

## 참고 문서

- [컨벤션 기준 원문](docs/conventions.md) — 모든 규칙의 상세·예시·근거·ESLint 설정. 규칙 변경 이력도 이 문서 하단에 있습니다
