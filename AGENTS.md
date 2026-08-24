# AGENTS.md

HOUME 프로젝트에서 작업할 때 참고하는 지침입니다. **AI 에이전트와 사람이 같이 읽습니다.**

**컨벤션의 SSOT(single source of truth)는 [docs/conventions.md](docs/conventions.md)입니다** — 규칙이 바뀌면 그 문서만 고칩니다. 이 파일을 포함한 나머지 문서는 요약이라, 내용이 서로 어긋나면 그 문서가 맞습니다.

이 파일에는 매 작업에 필요한 것만 두고, 상세 규칙·예시·근거는 그 문서를 봅니다.

## 개발 명령어

```bash
pnpm dev              # 개발 서버 (HMR)
pnpm build            # 프로덕션 빌드 (tsc -b && vite build)
pnpm typecheck        # 타입 검사만
pnpm lint             # ESLint 검사
pnpm lint --fix       # ESLint 자동 수정
pnpm format           # Prettier 포맷팅
pnpm knip             # 미사용 파일·export·의존성 리포트
```

CI가 머지 전에 돌리는 것 (로컬에서 같은 명령으로 재현 가능):

```bash
pnpm lint:ci          # ESLint. 경고도 0이어야 통과
pnpm format:check     # Prettier 검사
pnpm knip:ci          # 미사용 의존성·해석 실패 import
pnpm build
```

## 작업 시 지켜야 할 것

규칙의 상세와 이유는 conventions.md에 있습니다. 여기는 체크리스트입니다.
**[도구]** 표시가 있는 것은 ESLint·tsc가 자동으로 막으므로 리뷰에서 볼 필요가 없습니다.

**네이밍** — 폴더 camelCase / 컴포넌트 `PascalCase.tsx` / 스타일 `PascalCase.css.ts` / 페이지 `{Feature}Page` / 쿼리 훅 `use{Subject}Query` / mutation 훅 `use{Subject}Mutation` / API 함수 `{httpMethod}{Subject}` / 상수 UPPER_SNAKE_CASE

**API** — 모든 호출은 `request<T>()` 경유(axiosInstance 직접 사용 금지). 쿼리 키는 `queryKeys` factory. 1파일 = 1 API 작업(bare 함수 + 훅 colocate). 활성 쿼리는 `isPending`, 조건부 쿼리(`enabled`)는 `isLoading`

**경로** — `navigate()`·`<Navigate>`는 `ROUTES` 상수(`@routes/paths`). 하드코딩 금지

**스타일** — 폰트는 `fontVars`(`...fontVars.font.body_r_14`). raw `fontSize`·`fontWeight`·`lineHeight` 금지. 색상은 토큰에 있으면 `colorVars`를 쓰고, 토큰에 없으면 **두 곳 이상이 쓰는 값만** 토큰으로 추가한다. 한 컴포넌트에서만 쓰는 1회성 색상은 리터럴로 둔다 (conventions.md "디자인 토큰 사용 컨벤션")

**Export** — 컴포넌트는 default, 훅·유틸·상수·타입은 named. mixed export 금지

**Provider** — `src/main.tsx`에서만 추가

**[도구] import 경로** — 가장 짧은 alias를 쓴다. alias 목록은 `tsconfig.app.json`의 `paths`가 원본. `@/` prefix·3단계 이상 상대경로·barrel(`index.ts`) 금지

**[도구] 경계** — 페이지끼리 직접 import 금지, `shared/`·`store/`는 `pages/`를 import 금지. 두 페이지 이상이 쓰면 shared로 올린다

**[도구] 타입** — 환경변수는 `src/vite-env.d.ts`의 `ImportMetaEnv`에 반드시 선언한다. 선언하지 않으면 `any`가 되어 오타를 내도 빌드가 통과하고 런타임에 `undefined`가 된다

## 건드리면 안 되는 것

- **서버 API의 V2 표기** — `shared/apis/__generated__/data-contracts.ts`의 타입명, `/api/v2`·`/api/v4` URL 값은 서버 유래

## Git 워크플로우

- 브랜치: `develop`에서 분기 → `develop`으로 merge
- 브랜치 이름: `type/description/#issue-number` (예: `feat/login-page/#12`)
- 커밋: `type: 제목` (한국어). types: `feat` `fix` `refactor` `style` `design` `chore` `docs` `test` `rename` `remove`

## 참고 문서

- [컨벤션 SSOT](docs/conventions.md) — 모든 규칙의 상세·예시·근거. 무엇을 도구가 막고 무엇을 사람이 보는지도 여기에 있습니다

<!-- 유지보수 메모(에이전트 컨텍스트에는 들어가지 않음)
     이 파일이 본문이고 CLAUDE.md는 @AGENTS.md import 한 줄입니다.
     팀이 Codex·Cursor·Claude Code를 함께 쓰는데 Codex와 Cursor는 AGENTS.md를, Claude Code는 CLAUDE.md를 읽기 때문입니다. 내용을 CLAUDE.md로 옮기지 마세요.
     기술 스택·폴더 구조·alias 표는 의도적으로 뺐습니다 — package.json, ls src/, tsconfig.app.json을 읽으면 알 수 있는 것은 넣지 않습니다(Anthropic 권장 기준). -->
