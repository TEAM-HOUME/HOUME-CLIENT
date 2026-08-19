# HOUME-CLIENT 컨벤션 가이드

**이 문서가 컨벤션의 기준 원문(SSOT)입니다.** CLAUDE.md·AGENTS.md·.coderabbit.yaml은 요약과 이 문서로의 링크만 두고, 규칙 본문을 복사하지 않습니다. 규칙이 바뀌면 이 문서만 고칩니다.

**마지막 업데이트**: 2026-08-12 (리팩토링 5차 — 문서 최신화 + 규칙 강제 수단 도입)

새 규칙을 추가할 때는 아래 4가지를 통과해야 합니다. 통과하지 못하면 규칙이 아니라 취향이므로 넣지 않습니다.

1. 실제로 갈린 적이 있는가 — 같은 것을 두 방식으로 쓴 코드가 실제로 있었는가
2. 어겼을 때 무엇이 나빠지는지 한 문장으로 쓸 수 있는가
3. 위반을 어떻게 알아채는가 — 도구(ESLint·tsc·CI) / 리뷰 봇 / 사람 중 하나를 지정할 수 있는가
4. 지키는 비용이 안 지키는 비용보다 작은가

---

## 규칙을 무엇이 강제하는가

기준 3("위반을 어떻게 알아채는가")의 실제 배치입니다. 도구가 잡을 수 있는 것은 사람이 리뷰에서 보지 않습니다.

### 1계층 — 도구가 막는다 (머지 전 자동 검출)

CI(`.github/workflows/ci-cd.yml`)의 `lint` job과 `build` job에서 돌아갑니다. 로컬에서 같은 명령으로 재현할 수 있습니다.

| 명령                | 무엇을 막나                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| `pnpm lint:ci`      | ESLint 전체. 경고도 0으로 유지(`--max-warnings 0`) — 경고를 쌓으면 새 경고가 묻힌다 |
| `pnpm format:check` | Prettier 포맷                                                                       |
| `pnpm knip:ci`      | 미사용 의존성, package.json에 없는 import, 풀리지 않는 경로                         |
| `pnpm build`        | `tsc -b` 타입 검사 + Vite 빌드                                                      |

ESLint가 막는 것 중 이 문서의 규칙에 해당하는 것:

| 규칙                                                         | ESLint 규칙명                                     |
| ------------------------------------------------------------ | ------------------------------------------------- |
| `@/` 금지 · 최단 alias · 3단계 상대경로 · barrel 경유 import | `no-restricted-imports`                           |
| barrel 파일(`index.ts`) 생성                                 | `src/**/index.ts`에 `no-restricted-syntax`        |
| shared/store → pages, 화면 간 직접 import                    | `import/no-restricted-paths`                      |
| import 순서                                                  | `import/order` (`--fix` 자동 정렬)                |
| hook deps 누락                                               | `react-hooks/exhaustive-deps` (error)             |
| 쿼리 키 deps 누락                                            | `@tanstack/query/exhaustive-deps` (error)         |
| 스타일 토큰·단위                                             | `vanilla-extract/*`                               |
| `any` 유입, Promise 오용, enum 비교, 불필요한 타입 단언      | typescript-eslint `recommendedTypeChecked` 프리셋 |

#### 타입 정보를 읽는 규칙 — 표준 프리셋을 기준으로 둡니다

**규칙을 하나하나 고르지 않고 typescript-eslint의 `recommendedTypeChecked` 프리셋을 기준으로 둡니다.** 프리셋 안의 규칙은 표준이라 근거를 따로 적지 않고, **하우미에서 표준과 다르게 가는 것만** `eslint.config.js`에 이유와 함께 적습니다. 개별 규칙 설명은 `typescript-eslint.io/rules/{규칙명}`에 있습니다.

| 프리셋과 다르게 가는 것 | 무엇을                                                                                                                                                                                                                                                              | 왜                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 끔                      | `no-floating-promises` · `no-misused-promises`                                                                                                                                                                                                                      | 아래 "아직 막지 않는 것" 참고                                                                                           |
| 완화                    | `only-throw-error`                                                                                                                                                                                                                                                  | react-router가 라우트에서 `throw new Response(..., { status })`로 404를 errorElement에 넘긴다. 이 패턴만 `allow`에 등록 |
| 완화                    | `no-unused-vars`                                                                                                                                                                                                                                                    | 기존 규약 유지 — `_` prefix는 미사용 허용                                                                               |
| 추가 7개                | `non-nullable-type-assertion-style` · `no-unnecessary-type-arguments` · `no-unnecessary-template-expression` · `no-unnecessary-boolean-literal-compare` · `no-meaningless-void-operator` · `use-unknown-in-catch-callback-variable` · `switch-exhaustiveness-check` | 프리셋에는 없지만 도입 당시 25건을 잡아서 고쳤다 (대부분 `--fix`로 처리)                                                |

**상위 프리셋 `strictTypeChecked`는 채택하지 않았습니다.** 위반 234건이고, 그중 `no-confusing-void-expression` 122건 · `restrict-template-expressions` 61건 · `no-non-null-assertion` 38건입니다. 특히 마지막은 하우미가 쓰는 `!` 표기와 정면으로 충돌합니다. `recommendedTypeChecked`는 같은 시점에 11건이었습니다.

이 규칙들은 `parserOptions.projectService`를 켜야 동작합니다(2026-08-12 도입). 켜기 전에는 `no-floating-promises` 같은 규칙이 설정에 적혀 있어도 **아무 일도 하지 않았습니다.** src 전체 린트에 약 7초가 듭니다.

tsconfig에서 켜 둔 검사(`tsconfig.app.json`의 `Linting` 블록):

`strict` · `noUnusedLocals` · `noUnusedParameters` · `noFallthroughCasesInSwitch` · `noUncheckedSideEffectImports` · `erasableSyntaxOnly` · `isolatedModules` · `noImplicitOverride` · `noImplicitReturns` · `noPropertyAccessFromIndexSignature` · `allowUnreachableCode: false` · `allowUnusedLabels: false` · `noUncheckedIndexedAccess`

**환경변수는 `src/vite-env.d.ts`의 `ImportMetaEnv`에 반드시 선언합니다.** 선언하지 않은 이름은 Vite가 기본 제공하는 `[key: string]: any` 인덱스 시그니처로 떨어져서, 오타를 내도 컴파일이 통과하고 런타임에 `undefined`가 됩니다. `noPropertyAccessFromIndexSignature`가 이 누락을 컴파일 에러로 드러냅니다.

**아직 도구로 막지 않기로 한 것** (이유가 있는 미채택):

| 규칙                                                     | 위반 수        | 미채택 이유                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-floating-promises` (프리셋에 있음 → 끔)              | 84건           | 건별로 "이 요청이 실패하면 사용자에게 보여줄 것인가"를 정해야 고칠 수 있다. 에러 처리 정책에서 정한 뒤 켠다. 지금 켜면 판단 없이 `void`만 붙이게 되어 규칙이 무력화된다                                                                                                                                                                                                |
| `no-misused-promises` (프리셋에 있음 → 끔)               | 27건           | 같음. Promise를 돌려주는 함수를 `() => void` 자리에 넘기는 패턴(`onRetry={refetch}` 등)                                                                                                                                                                                                                                                                                |
| `no-unnecessary-condition` (프리셋에 없음 → 안 넣음)     | 64건           | 서버 생성 타입(`__generated__`)이 실제보다 낙관적이라(nullable이어야 할 필드가 non-nullable) **실제로 필요한 방어 코드를 지우라고 시킨다.** 방향이 틀린 규칙이라 나중에도 안 켤 가능성이 높다                                                                                                                                                                          |
| `exactOptionalPropertyTypes` (tsconfig)                  | 181건 / 78파일 | React prop 전달 패턴과 충돌. 비용 대비 이득이 작다                                                                                                                                                                                                                                                                                                                     |
| `no-non-null-assertion` (strict 프리셋에 있음 → 안 넣음) | 38건           | `!`는 컴파일 시점 표기라 그 자체로 예외를 던지지 않지만, **검사를 끄기 때문에 가정이 틀리면 `undefined`가 흘러가 엉뚱한 곳에서 터진다.** 지금 38건은 대부분 서버 생성 타입이 optional로 나오지만 실제로는 항상 오는 필드(`plan.id!` 등)다. 규칙만 켜면 `?? 기본값`을 억지로 붙이게 되므로 **먼저 생성 타입의 nullable 표기를 서버와 맞추는 게 순서다.** 그 뒤에 재검토 |

### 2계층 — 리뷰 봇이 본다

기계 판정은 안 되지만 패턴 대조는 되는 것. `.coderabbit.yaml`이 이 문서를 기준으로 읽습니다. 네이밍 의미(`use{Subject}Query` 같은 형태는 도구가 보지만 이름이 대상을 제대로 가리키는지는 못 봄), 주석의 정확성, 규칙 예외에 이유가 붙어 있는지.

### 3계층 — 사람이 판단한다

폴더 배치, 공유 여부, 상태 위치, 캐시 값, 새 규칙의 채택 여부. 도구가 대신할 수 없는 것만 남깁니다.

---

## Query Key 컨벤션

### 규칙

1. **모든 쿼리 키는 `queryKeys` factory를 통해 생성한다**
   - 파일: `src/shared/constants/queryKey.ts`
   - 하드코딩 문자열 배열 (`['mypage-user']`) 사용 금지

2. **도메인별 계층 구조를 따른다**

   ```typescript
   queryKeys.{domain}.{key}(params?)
   // e.g., queryKeys.mypage.imageDetail(houseId)
   ```

3. **각 도메인은 `.all` 키를 가진다** — 도메인 전체 invalidation용

   ```typescript
   queryKeys.mypage.all; // ['mypage']
   ```

4. **동적 파라미터는 factory 함수의 인자로 전달한다**

   ```typescript
   // ✅ Good
   queryKeys.generate.result(houseId)[
     // ❌ Bad
     ('generate', 'result', houseId)
   ];
   ```

5. **factory 변수명은 용도를 명시한다**

   ```typescript
   // ✅ Good
   const categoryQueryVars: CategoriesQueryVariables = { ... };
   const productQueryVars: ProductsQueryVariables = { ... };

   // ❌ Bad
   const vars = { ... };
   ```

### 현재 도메인 목록

9개 도메인. 정확한 키 목록은 `src/shared/constants/queryKey.ts`가 원본이고, 여기에는 도메인 이름만 둡니다 (키가 추가될 때마다 문서가 낡는 것을 막기 위함 — 2026-08-12 변경).

`landing` · `product` · `banner` · `imageSetup` · `generate` · `furniture` · `mypage` · `styles` · `signup`

- 찜 목록 키는 독립 도메인이 아니라 `queryKeys.mypage.jjymList()`입니다.

### factory 코드 읽는 법

`queryKeys`는 **키 배열을 만들어 돌려주는 함수들을 모아둔 객체**다. "팩토리(factory)"는 값을 만들어 주는 함수를 가리키는 일반적인 표현이다.

```typescript
landing: {
  all: ['landing'] as const,
  history: () => [...queryKeys.landing.all, 'history'] as const,
},
```

- `all`은 도메인 접두어다. 값은 `['landing']`.
- `[...queryKeys.landing.all, 'history']`의 `...`는 **spread** — 앞 배열의 원소를 펼쳐 놓는다. 결과는 `['landing', 'history']`. 접두어를 직접 다시 쓰지 않고 `all`을 펼쳐 쓰기 때문에, 도메인 이름을 바꾸면 그 아래 키가 전부 따라 바뀐다.
- `as const`는 배열을 읽기 전용 튜플 타입으로 고정한다. 없으면 타입이 `string[]`으로 넓어져서 키끼리 타입 수준의 구분이 사라진다.
- 파라미터가 있는 키는 함수 인자로 받는다: `productDetail: (id: number) => [...all, 'productDetail', id]`.

### factory를 쓰는 이유

1. **부분 무효화가 된다.** TanStack Query의 `invalidateQueries`는 키 앞부분이 일치하면 전부 무효화한다. `queryKeys.product.all`로 무효화하면 그 아래 productList·productDetail이 한 번에 갱신된다. 접두어를 spread로 공유하기 때문에 성립하는 동작이다.
2. **오타가 컴파일에서 걸린다.** 문자열 배열을 직접 쓰면 `['mypage']`와 `['myPage']`가 서로 다른 캐시가 되는데도 타입 검사를 통과한다.
3. **사용처를 grep으로 찾을 수 있다.** `queryKeys.product.productList`로 검색하면 쓰는 곳이 전부 나온다.

### ESLint `@tanstack/query/exhaustive-deps`

`eslint.config.js`에 **`error`로 켜져 있다.** 검사 내용은 "`queryFn` 안에서 쓰는 값이 `queryKey`에도 들어 있는가"다.

```typescript
// ❌ 규칙이 잡는 코드 — productId가 바뀌어도 키가 같아서 이전 상품이 캐시에서 나온다
useQuery({
  queryKey: queryKeys.product.all,
  queryFn: () => getProduct(productId),
});
```

**오탐(false positive)이 나는 경우**: `queryKey`에 배열을 직접 쓰지 않고 미리 만들어 둔 변수를 넣으면, 규칙이 그 변수 안에 무엇이 들었는지 볼 수 없어 "빠졌다"고 판정한다. 이때만 사유 주석과 함께 끈다.

```typescript
// 실물: useGeneratedCategoriesQuery.ts
// eslint-disable-next-line @tanstack/query/exhaustive-deps -- imageId는 categoriesQueryKey(변수) 안에 포함됨
queryKey: categoriesQueryKey,
```

> 참고: `@typescript-eslint/no-unused-vars`의 `_` prefix 허용(`const { houseType: _, ...rest } = prev;`)은 쿼리 키와 무관한 전체 공통 규칙이다. 설정은 `eslint.config.js`에 있다.

---

## Import / Path Alias 컨벤션

### 두 가지 규칙과 각각의 이유

**① alias를 쓴다 (상대경로 대신).** 이유는 상대경로가 깊어질수록 깨지기 쉽기 때문이다. `../../../shared/apis/...`는 파일을 다른 폴더로 옮기는 순간 조용히 다른 곳을 가리키거나 깨지고, 읽을 때 몇 단계인지 세야 한다.

**② 여러 alias가 가능하면 가장 짧은 것을 쓴다.** 이유는 **검색 가능성**이다. 같은 파일을 세 형태로 import하면 사용처를 grep으로 찾을 때 세 번 검색해야 하고 하나를 놓친다 (리팩토링 2차에서 `@styles/tokens/`·`@shared/styles/tokens/`·`@/shared/styles/tokens/` 3형태 218건을 통일했다).

```typescript
// ✅ Good — 가장 짧은 alias
import { colorVars } from '@styles/tokens/color.css';
import ActionButton from '@components/button/actionButton/ActionButton';

// ❌ Bad — 불필요하게 긴 경로
import { colorVars } from '@shared/styles/tokens/color.css';
import { colorVars } from '@/shared/styles/tokens/color.css';
```

### 사용 가능한 Alias 목록

| Alias          | 실제 경로                | 용도                          |
| -------------- | ------------------------ | ----------------------------- |
| `@pages/`      | `src/pages/`             | Feature 페이지                |
| `@routes/`     | `src/routes/`            | 라우팅 설정                   |
| `@store/`      | `src/store/`             | 전역 Zustand 스토어           |
| `@shared/`     | `src/shared/`            | shared 직접 접근 (config 등)  |
| `@analytics/`  | `src/shared/analytics/`  | GA 이벤트·파라미터·유틸       |
| `@apis/`       | `src/shared/apis/`       | HTTP 클라이언트, request 래퍼 |
| `@assets/`     | `src/shared/assets/`     | 이미지, SVG 등                |
| `@components/` | `src/shared/components/` | 공통 UI 컴포넌트              |
| `@constants/`  | `src/shared/constants/`  | 상수, 쿼리 키                 |
| `@hooks/`      | `src/shared/hooks/`      | 공통 훅                       |
| `@styles/`     | `src/shared/styles/`     | 디자인 토큰, 글로벌 스타일    |
| `@utils/`      | `src/shared/utils/`      | 유틸리티 함수                 |

### 금지 패턴

1. **`@/` prefix 사용 금지** — 모든 세부 alias로 대체됨

   ```typescript
   // ❌ Bad
   import { colorVars } from '@/shared/styles/colors.css';
   import Button from '@/pages/generate/...';

   // ✅ Good
   import { colorVars } from '@styles/colors.css';
   import Button from '@pages/generate/...';
   ```

2. **`@types/` alias 사용 불가** — npm `@types` 스코프와 충돌

   ```typescript
   // ❌ Bad — TypeScript가 DefinitelyTyped로 해석
   import type { ToastType } from '@types/toast';

   // ✅ Good
   import type { ToastType } from '@shared/types/toast';
   ```

   **위 표가 alias의 전부다.** 표에 없는 shared 하위 폴더(`types` · `monitoring` · `config`)는 `@shared/{폴더}/`가 최단 형태이며, 이것은 규칙 위반이 아니다.

   목록은 닫아 둔다. 위 두 규칙의 목적은 목록이 무엇이든 달성되는 반면, alias를 새로 추가하면 기존 `@shared/{폴더}/` import를 전부 함께 고쳐야 하기 때문이다. `@analytics/`는 사용량이 316줄로 압도적이어서 2026-08-12에 추가했고, 그때 316줄을 일괄 치환했다. 그 아래 규모(`types` 45줄)는 추가하지 않는다.

3. **3단계 이상 상대경로 금지**

   ```typescript
   // ❌ Bad
   import { request } from '../../../shared/apis/request';

   // ✅ Good
   import { request } from '@apis/config/request';
   ```

4. **Feature 내부에서는 상대경로 허용** (1~2단계)

   ```typescript
   // ✅ OK — 같은 feature 내부
   import { useHouseInfo } from '../hooks/useHouseInfo';
   import { HouseInfo } from './HouseInfo';
   ```

   1~2단계를 허용하는 이유:
   - **검색 가능성을 해치지 않는다.** 어떤 파일이 어디서 쓰이는지 찾을 때 실제로 grep하는 것은 경로가 아니라 심볼 이름(`useHouseInfo`)이다. 경로 형태는 그 검색에 영향을 주지 않는다.
   - **깨질 위험이 낮다.** 상대경로가 위험해지는 것은 깊이 때문인데, 1~2단계는 같은 기능 폴더 안이라 폴더를 옮길 때 참조 관계가 통째로 함께 이동한다.
   - **모듈 내부 참조라는 신호가 된다.** 전부 alias로 바꾸면 "이 폴더 안의 것"과 "밖에서 가져온 것"이 코드에서 구분되지 않는다.

### ESLint 설정

- `import/order` pathGroups에 모든 alias가 `internal` 그룹으로 등록됨 → `eslint --fix`로 순서 자동 정렬
- 위 금지 패턴 1·3은 `no-restricted-imports`로 막는다. `@/`, `@shared/{더 짧은 alias가 있는 폴더}`, `../../../`로 시작하는 경로가 모두 에러다
- `import/no-restricted-paths`로 의존 방향을 막는다 (아래 Cross-Feature Import 참고)

---

<!-- Phase 2 완료 -->

## 네이밍 컨벤션

### 파일/폴더 네이밍

| 대상          | 규칙              | 예시                                         |
| ------------- | ----------------- | -------------------------------------------- |
| 폴더          | camelCase         | `floorPlan/`, `houseInfo/`, `imageSetup/`    |
| 컴포넌트 파일 | PascalCase.tsx    | `FloorPlan.tsx`, `CardCuration.tsx`          |
| 스타일 파일   | PascalCase.css.ts | `FloorPlan.css.ts`                           |
| 훅 파일       | use{Subject}.ts   | `useHouseInfo.ts`, `useGenerate.ts`          |
| API 파일      | 훅 이름과 동일    | `useStackDataQuery.ts`, `useJjymMutation.ts` |
| 타입 파일     | {도메인}.ts       | `generate.ts`, `detection.ts`                |
| 상수 파일     | {도메인}.ts       | `detection.ts`, `response.ts`                |

### 코드 네이밍

| 대상                  | 규칙                            | 예시                                                               |
| --------------------- | ------------------------------- | ------------------------------------------------------------------ |
| 컴포넌트              | PascalCase (파일명과 동일)      | `HomePage`, `FlipButton`, `LargeFilledButton`                      |
| 페이지 컴포넌트       | `{Feature}Page`                 | `HomePage`, `LoginPage`, `ImageSetupPage`                          |
| 커스텀 훅 (상태/로직) | `use{Subject}`                  | `useABTest`, `useFloorPlan`, `useCreditCheck`                      |
| Query 훅              | `use{Subject}Query`             | `useStackDataQuery`, `useFallbackImageQuery`, `useMyPageUserQuery` |
| Mutation 훅           | `use{Subject}Mutation`          | `useGenerateImageMutation`, `useLogoutMutation`                    |
| API 함수              | `{httpMethod}{Subject}`         | `getFloorPlan`, `postHousingSelection`                             |
| 상수                  | UPPER_SNAKE_CASE                | `API_ENDPOINT`, `QUERY_KEY`, `ROUTES`                              |
| 타입/인터페이스       | PascalCase                      | `CarouselItem`, `BaseResponse<T>`                                  |
| Props                 | `{Component}Props`              | `ButtonProps`, `FloorPlanProps`                                    |
| Zustand 스토어        | `use{Domain}Store`              | `useUserStore`, `useGenerateStore`                                 |
| 쿼리키 팩토리         | `queryKeys.{domain}.{action}()` | `queryKeys.generate.result(houseId)`                               |

### Query/Mutation 접미사 규칙

- **`Query` 접미사**: `useQuery`를 래핑하는 훅에만 붙인다
- **`Mutation` 접미사**: `useMutation`을 래핑하는 훅에만 붙인다
- **상태/로직 훅**: `useQuery`/`useMutation`을 사용하지 않으면 접미사 없이 `use{Subject}`

```typescript
// ✅ Good
export const useStackDataQuery = (...) => useQuery({ ... });     // Query 래퍼
export const useGenerateImageMutation = () => useMutation({ ... }); // Mutation 래퍼
export const useABTest = () => { ... };                          // 상태/로직 훅

// ❌ Bad
export const useStackData = (...) => useQuery({ ... });          // Query인데 접미사 없음
export const useGenerateImageApi = () => useMutation({ ... });   // Api 접미사 사용
```

---

<!-- Phase 3 완료 -->

## 폴더 구조 + Cross-Feature Import

### src 최상위 구분

`pages/` · `shared/` · `store/` · `routes/` 네 개다. 표준을 따른 것이 아니라 만들면서 굳어진 구분이므로, 다음 근거로 현행을 유지한다 (2026-08-12 재검토).

- `store/`를 `shared/` 아래로 옮기는 것도 가능하지만 얻는 것이 없다. `@store/`로 이미 위치가 명확하고, 옮기면 import만 바뀐다.
- 성격이 다르기도 하다. `shared/`는 가져다 쓰는 부품이고, `store/`는 앱 전체가 공유하는 하나뿐인 상태다 (`useUserStore`, `useFunnelStore`, `useImageFlowStore`, `useSavedItemsStore`).

### Cross-Feature Import 규칙

**이 규칙의 목적** — 의존 방향을 한쪽으로 고정하면 다음 세 가지를 얻는다.

1. **파일의 위치가 변경 영향 범위를 알려준다.** `pages/mypage/` 안에 있으면 고칠 때 mypage만 확인하면 되고, `shared/`에 있으면 전체를 확인해야 한다. 양방향 참조가 있으면 위치가 거짓말을 한다 — 실제로 리팩토링 4차 이전의 `useMyPageUserQuery`는 mypage 폴더에 있으면서 home 헤더·크레딧 가드·인증 동기화까지 영향을 주고 있었다.
2. **페이지 폴더 단위로 작업하는 것이 안전해진다.** 새 기능을 한 페이지에 붙일 때 그 폴더만 건드리면 되는지 판단할 수 있다.
3. **규칙이 단순해야 도구로 검사할 수 있다.** "페이지끼리 금지, shared→pages 금지" 두 줄이면 ESLint `import/no-restricted-paths`로 자동 검출되지만, 예외가 늘어나면 사람이 매번 판단해야 한다.

4. **Feature는 다른 Feature를 직접 import할 수 없다**

   ```typescript
   // ❌ Bad — feature → feature
   import { usePostJjymMutation } from '@pages/generate/hooks/useSaveItem';

   // ✅ Good — shared 모듈 사용
   import { useJjymMutation } from '@hooks/useJjymMutation';
   ```

5. **`shared/`는 `pages/`를 import할 수 없다**

   ```typescript
   // ❌ Bad — shared → feature
   import { getActivityOptions } from '@pages/imageSetup/apis/activityInfo';

   // ✅ Good — feature 내부로 이동하거나 shared로 추출
   ```

6. **App-level (`routes/`, `main.tsx`)은 feature import 허용**

   ```typescript
   // ✅ OK — app-level 오케스트레이션
   import { prefetchStaticData } from '@pages/imageSetup/utils/staticDataPrefetch';
   ```

   `main.tsx`가 이 예외의 실제 사용처다. 정적 데이터 prefetch는 원래 `shared/apis/config/queryClient.ts`에서 호출했는데, 무엇을 미리 받을지는 imageSetup 화면이 정하는 내용이라 shared가 pages를 알게 됐다. 2026-08-12에 호출을 `main.tsx`로 옮겼다.

**강제 수단**: 4·5번은 ESLint `import/no-restricted-paths`로 막는다. 화면 폴더 10개마다 "자기 폴더를 제외한 `src/pages` 전체"를 금지 구역으로 등록해 두었고(`eslint.config.js`의 `crossPageZones`), `src/shared`·`src/store`에서 `src/pages`로 가는 것도 함께 막는다. `src/routes`·`src/main.tsx`는 구역에 넣지 않아 위 6번 예외가 성립한다.

### Detection(ONNX 가구 탐지) 모듈 — 2026-08-18 삭제됨

**삭제했다. 지금 이 코드는 레포에 없다.** 팀 합의로 제거했고, 필요해지면 아래 절차로 되살린다.

무엇을 지웠나 — 총 31파일 + 바이너리 2개 + 의존성 1개:

| 대상                    | 내용                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/shared/detection/` | 17파일 (모델 로더, 핫스팟 파이프라인, 캐시 스토어, obj365 클래스 표 등)                                                                         |
| `src/pages/generate/`   | 6파일 (`useGeneratedCategoriesQuery` `useCurationState` `useCurationStore` `useCurationCacheStore` `hotspotCategoryResolver` `types/furniture`) |
| `src/pages/mypage/`     | 5파일 (`useDetectionPrefetch` 3종 + `detectionPrefetch.types` + `resultNavigation`)                                                             |
| 기타                    | `useWelcomePageModelPreload`(본문이 빈 함수였음)                                                                                                |
| 바이너리                | `public/models/*.onnx` + `public/onnxruntime/*.wasm` — 합계 약 53MB                                                                             |
| 의존성                  | `onnxruntime-web` (삭제 시점 1.23.2)                                                                                                            |

지울 때 함께 정리한 것 — 살아 있던 코드에서 detection을 참조하던 3곳:

- `store/useUserStore.ts` — 로그아웃 시 `useDetectionCacheStore.clear()` 호출 제거
- `pages/mypage/.../GeneratedImagesSection.tsx` — 빈 함수를 부르던 prefetch 로직 제거 (useEffect 1개, useCallback 2개)
- `shared/constants/queryKey.ts` — `CategoriesQueryVariables` · `ProductsQueryVariables` · `furniture` 도메인 제거 (전부 삭제된 코드에서만 쓰였다)

그 밖에 `GenImgCard`의 `onImageLoad` prop(소비자 소멸), `apiEndpoints`의 `CURATION_CATEGORIES` v1 엔드포인트를 함께 제거했다.

**남아 있는 큐레이션 기능은 이것과 별개다.** `CurationResult.tsx`는 `useCurationCategoriesQuery`(v2 추천형)를 쓰며 객체 인식을 거치지 않는다. 삭제 대상이 아니었다.

#### 되살리는 방법

커밋 해시는 rebase하면 바뀌므로 경로로 찾는다.

```bash
# 1) 삭제 커밋 찾기
git log --oneline --diff-filter=D -- src/shared/detection/

# 2) 그 커밋의 직전 상태에서 파일을 되돌린다
git checkout <위에서 찾은 해시>^ -- \
  src/shared/detection \
  src/pages/generate/apis/queries/useGeneratedCategoriesQuery.ts \
  src/pages/generate/hooks/useCurationState.ts \
  src/pages/generate/stores/useCurationStore.ts \
  src/pages/generate/stores/useCurationCacheStore.ts \
  src/pages/generate/utils/hotspotCategoryResolver.ts \
  src/pages/generate/types/furniture.ts \
  src/pages/mypage/hooks \
  src/pages/mypage/utils/resultNavigation.ts \
  public/models public/onnxruntime

# 3) 의존성 복구
pnpm add onnxruntime-web@1.23.2
```

되돌린 뒤에는 위 "함께 정리한 것" 3곳을 다시 연결해야 한다. 삭제 커밋 하나만 통째로 뒤집는 `git revert <해시>`가 더 간단하다.

`pnpm knip:ci`(CI 게이트)에는 미사용 파일 검사를 넣지 않는다. 사용처 없이 컴포넌트를 먼저 구현하고, 다음 PR에서 컴포넌트(파일)를 실제로 사용하는 개발 플로우를 고려했을 때, 미사용 파일 규칙을 포함할 경우 일반적인 플로우에서도 PR이 머지되지 못할 가능성이 있다. **채택 기준 4번(지키는 비용 < 안 지키는 비용)을 통과하지 못한다.**

미사용 파일 검사는 `pnpm knip`(로컬 전체 리포트)에는 그대로 남아 있다. "컴포넌트를 사용처 없이 머지하는 것을 허용할지"를 팀이 정하면 그때 게이트에 다시 넣는다.

**주의**: 파일을 지워도 **git 히스토리에는 53MB 바이너리가 그대로 남는다.** 클론 용량은 줄지 않는다. 줄이려면 히스토리 재작성(`git filter-repo` 등)이 필요한데, 팀 전원이 다시 클론해야 하므로 별도 합의 사항으로 남긴다.

### shared/apis/ 구조

인프라 설정과 공유 API를 분리한다:

```
shared/apis/
├── config/                   # 인프라 설정 (건드릴 일 거의 없음)
│   ├── axiosInstance.ts      # Axios 인스턴스 + 인터셉터
│   ├── globalErrorHandler.ts # QueryCache·MutationCache onError 핸들러
│   ├── queryClient.ts        # QueryClient 생성 + 기본 옵션
│   └── request.ts            # request<T>() 래퍼 + rawResponse 오버로드
├── queries/                  # 여러 페이지가 쓰는 query 훅
└── mutations/                # 여러 페이지가 쓰는 mutation 훅
```

```typescript
// 인프라 import — @apis/config/
import { HTTPMethod, request } from '@apis/config/request';
import { queryClient } from '@apis/config/queryClient';

// 공유 쿼리·mutation import
import { useMyPageUserQuery } from '@apis/queries/useMyPageUserQuery';
import { useJjymMutation } from '@apis/mutations/useJjymMutation';
```

### 공유 코드의 배치 기준

쿼리·타입·유틸을 어디에 둘지는 **쓰는 페이지 수**로 정한다.

1. **한 페이지만 쓰면** 그 페이지 폴더 안에 둔다 (`pages/{feature}/apis/queries/` 등)
2. **두 페이지 이상이 쓰면** shared로 올린다 (`shared/apis/queries/`, `shared/types/` 등)
3. shared 안에서 **한 도메인의 파일이 3개 이상**(타입·쿼리·mutation·유틸)으로 흩어지면 도메인 폴더(entities) 신설을 검토한다 — 현재는 해당 없음, 보류 상태

2번 기준을 지키지 않으면 페이지 A의 파일을 고칠 때 페이지 B가 조용히 깨진다. 실제로 리팩토링 4차 이전에는 `useMyPageUserQuery`가 mypage 폴더에 있으면서 home 헤더·크레딧 가드·인증 동기화까지 쓰이고 있어서, 위치만 보고는 변경 영향 범위를 알 수 없었다.

entities 층을 지금 만들지 않은 이유: 3번 조건에 해당하는 도메인이 아직 없어서 층을 만들면 shared를 이름만 바꾼 것이 된다. 필요해지면 `shared/apis` → `entities/{도메인}` 이동은 기계적이다.

### Feature 내부 폴더 구조

| 하위 폴더     | 용도                                   | 예시                                |
| ------------- | -------------------------------------- | ----------------------------------- |
| `apis/`       | `queries/`·`mutations/` 하위에 훅 파일 | `apis/queries/useStackDataQuery.ts` |
| `components/` | Feature UI 컴포넌트                    | `ButtonGroup/`, `CardCuration/`     |
| `hooks/`      | Feature 훅                             | `useGenerate.ts`                    |
| `types/`      | Feature 타입 정의                      | `generate.ts`, `furniture.ts`       |
| `steps/`      | 퍼널 스텝 (해당 시)                    | `houseInfo/`, `floorPlan/`          |
| `stores/`     | Feature Zustand 스토어                 | `useCurationStore.ts`               |
| `constants/`  | Feature 상수                           | `progressConfig.ts`                 |
| `utils/`      | Feature 유틸리티                       | `analytics.ts`                      |

<!-- Phase 4 완료 -->

## Export 컨벤션

### 용어

```typescript
// named export — 이름을 붙여 내보낸다. 한 파일에 여러 개 가능
export const getStackData = async () => { ... };
export const useStackDataQuery = () => { ... };
import { getStackData, useStackDataQuery } from '...'; // 이름이 정확히 일치해야 한다

// default export — 파일당 하나. "이 파일의 대표"를 내보낸다
const HomePage = () => { ... };
export default HomePage;
import HomePage from '...';   // 받는 쪽이 이름을 마음대로 정할 수 있다
import Anything from '...';   // 이것도 동작한다
```

### 핵심 규칙

| 대상                   | Export 방식      | 이유                                                               |
| ---------------------- | ---------------- | ------------------------------------------------------------------ |
| 컴포넌트 (\*.tsx)      | `default export` | 라우터가 default를 꺼내 쓴다, 1파일=1컴포넌트                      |
| 훅 (use\*.ts)          | `named export`   | 한 파일에 여러 개를 내보내야 하고, 이름이 강제돼 grep이 정확해진다 |
| 유틸 (utils/\*.ts)     | `named export`   | 〃                                                                 |
| 상수 (constants/\*.ts) | `named export`   | 〃                                                                 |
| 타입 (types/\*.ts)     | `named export`   | 〃                                                                 |
| 스토어 (stores/\*.ts)  | `named export`   | 〃                                                                 |

근거를 풀어 쓰면:

- **컴포넌트가 default인 이유** — `route.lazy`가 `const { default: SignupPage } = await import(...)` 형태로 default를 꺼낸다(`routes/router.tsx`). named로도 라우터를 쓸 수는 있지만 현재 13개 lazy 라우트가 전부 이 형태라, 섞이면 라우트마다 꺼내는 방식이 달라진다.
- **훅·유틸이 named인 이유** — API 파일은 bare 함수(`getStackData`)와 훅(`useStackDataQuery`)을 한 파일에서 함께 내보내야 하므로 default로는 불가능하다. 그리고 default는 받는 쪽에서 이름을 바꿀 수 있어, 이름으로 사용처를 grep할 때 샌다.
- **mixed(둘 다) 금지 이유** — 한 파일이 둘 다 쓰면 어느 방식으로 가져와야 하는지 그 파일을 열어봐야 알 수 있다.

### 컴포넌트 Default Export 패턴 (rafce 스타일)

```typescript
// ✅ Good — rafce 스타일
const DragHandle = () => {
  return <div>...</div>;
};

export default DragHandle;

// ✅ Good — forwardRef도 동일
const AnimatedSection = forwardRef<HTMLDivElement, Props>(
  (props, ref) => { ... }
);

export default AnimatedSection;

// ❌ Bad — named export
export const DragHandle = () => { ... };

// ❌ Bad — mixed export
export const FlipSheet = () => { ... };
export default FlipSheet;
```

### Named Export 패턴

```typescript
// ✅ Good — 훅
export const useToast = () => { ... };
export const useMyPageUserQuery = (...) => useQuery({ ... });

// ✅ Good — 상수
export const API_ENDPOINT = { ... };
export const ROUTES = { ... };

// ✅ Good — 유틸
export const getCanHistoryGoBack = () => { ... };
```

### 금지 패턴

1. **Barrel export (index.ts) 금지**

   ```typescript
   // ❌ Bad — index.ts 재내보내기
   export { Button } from './Button';
   export { Input } from './Input';
   ```

   금지 이유는 두 가지다.
   - **사용처 검색이 샌다.** barrel을 거쳐 import하면(`from '@shared/analytics/hooks'`) 실제 파일 경로로 grep해도 그 사용처가 나오지 않는다. 이 문서의 다른 규칙들이 목표로 하는 검색 가능성과 정면으로 충돌한다.
   - **순환 참조가 쉽게 생긴다.** barrel이 A·B·C를 모두 내보내는 상태에서 A가 barrel을 import하면 A → barrel → A 고리가 만들어진다.

   트리셰이킹은 주된 근거가 아니다. 요즘 번들러는 대체로 처리하며, 부작용이 있는 모듈이 섞였을 때만 문제가 된다.

   대가도 있다. barrel이 없으면 여러 개를 가져다 쓸 때 import 줄이 늘어난다.

   **예외 없음 (2026-08-12).** 마지막까지 남아 있던 `src/shared/analytics/`의 barrel 7개를 해체했다(import 72줄/49파일을 실제 파일 경로로 치환). 현재 `src/` 아래 `index.ts`는 0개다.

   barrel에 적혀 있던 "이 폴더의 파일별 역할" 표는 같은 폴더의 `README.md`로 옮겼다. 폴더를 설명하고 싶으면 barrel이 아니라 README를 쓴다.

2. **Mixed export 금지** — 한 파일에 named + default 혼용 금지

   ```typescript
   // ❌ Bad
   export const Component = () => { ... };
   export default Component;
   ```

<!-- Phase 5 완료 -->

## API/데이터 페칭 컨벤션

### 파일 구조

```
pages/{feature}/apis/
├── queries/
│   └── use{Subject}Query.ts       # bare 함수 + query 훅
├── mutations/
│   └── use{Subject}Mutation.ts    # bare 함수 + mutation 훅
└── {action}.ts                    # 훅 불필요한 단발성 bare 함수
```

- **1파일 = 1 API 작업**: bare API 함수와 React Query 훅을 같은 파일에 colocate
- **파일 네이밍**: 훅 이름으로 (`useXxxQuery.ts`, `useXxxMutation.ts`) — camelCase

### 파일 내부 패턴

```typescript
// queries/useXxxQuery.ts
import { useQuery } from '@tanstack/react-query';
import { HTTPMethod, request } from '@apis/config/request';
import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';

// 1. bare API 함수 (named export)
export const getXxx = async (): Promise<XxxResponse> => {
  return request<XxxResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.XXX.YYY,
  });
};

// 2. React Query 훅 (named export)
export const useXxxQuery = () => {
  return useQuery({
    queryKey: queryKeys.xxx.yyy(),
    queryFn: getXxx,
  });
};
```

### TanStack Query 상태값 규칙

TanStack Query v5는 쿼리 상태를 **서로 독립적인 두 축**으로 관리한다. 이걸 알면 아래 규칙이 전부 따라 나온다.

| 축        | 필드          | 값                              | 무엇을 말하는가                 |
| --------- | ------------- | ------------------------------- | ------------------------------- |
| 데이터 축 | `status`      | `pending` / `success` / `error` | **보여줄 데이터가 있는가**      |
| 요청 축   | `fetchStatus` | `fetching` / `paused` / `idle`  | **지금 요청이 날아가고 있는가** |

파생 플래그는 이 두 축의 조합이다.

| 플래그       | 정의                         | 뜻                                                    |
| ------------ | ---------------------------- | ----------------------------------------------------- |
| `isPending`  | `status === 'pending'`       | 보여줄 데이터가 없다. **요청 여부와는 무관하다**      |
| `isFetching` | `fetchStatus === 'fetching'` | 요청이 진행 중이다                                    |
| `isLoading`  | `isPending && isFetching`    | 보여줄 데이터가 없고 + 요청도 진행 중이다 (= 첫 로딩) |

두 축이 독립이라 조합이 나뉜다. 첫 요청이 날아가는 중에는 `isPending`과 `isFetching`이 **둘 다 true**이고, 그래서 `isLoading`이 true가 된다. 캐시에 데이터가 있는 상태로 갱신 중이면 `isPending`은 false, `isFetching`만 true다.

#### `enabled: false`일 때 왜 갈리는가

`enabled: false`는 요청을 보내지 않겠다는 설정이므로 `fetchStatus`가 `idle`로 멈춘다. 그런데 데이터는 영영 도착하지 않으므로 `status`는 `pending`에 머문다.

| 플래그       | `enabled: false`일 때 | 이유                                             |
| ------------ | --------------------- | ------------------------------------------------ |
| `isPending`  | **항상 `true`**       | 데이터가 없는 상태가 계속되므로                  |
| `isFetching` | 항상 `false`          | 요청을 보내지 않으므로                           |
| `isLoading`  | **항상 `false`**      | `isPending && isFetching`에서 뒷항이 false이므로 |

그래서 조건부 쿼리에서 `isPending`으로 로딩 화면을 그리면 **조건이 false인 동안 로딩 화면이 영구히 남는다.** `isLoading`을 쓰면 "요청이 실제로 날아가는 중"일 때만 true가 되므로 이 문제가 없다.

#### 사용 규칙

- **항상 활성 쿼리** (enabled 없음 또는 `enabled: true`): `isPending` 사용
- **조건부 쿼리** (`enabled: someCondition`): `isLoading` 사용
  - `isPending`은 disabled 쿼리에서도 `true` → 영구 로딩 버그 유발
- `useState`로 직접 만든 로컬 로딩 플래그의 이름은 `isLoading`이어도 된다. 위 규칙은 TanStack Query가 돌려주는 값에만 적용되며, 직접 만든 boolean과는 무관하다 (실물: `useABTest.ts:97`, `useOnnxModel.ts:171`)

```typescript
// ✅ Good — 항상 활성 쿼리
const { data, isPending } = useXxxQuery();

// ✅ Good — 조건부 쿼리 (enabled가 false일 수 있음)
const { data, isLoading } = useXxxQuery({ enabled: isLoggedIn });

// ❌ Bad — 조건부 쿼리에서 isPending 사용 (disabled 시 영구 true)
const { data, isPending } = useXxxQuery({ enabled: isLoggedIn });

// ✅ OK — useState 기반은 isLoading 허용
const [isLoading, setIsLoading] = useState(false);
```

### 경로 상수 규칙

- **모든 `navigate()`, `<Navigate>` 경로는 `ROUTES` 상수 사용** (`@routes/paths`)
- 하드코딩 문자열 경로 금지 (`'/'`, `'/mypage'` 등)
- **예외**: `window.location.href`는 React Router 사용 불가 상황 (에러 폴백)에서만 허용

```typescript
// ❌ Bad — 하드코딩 경로
navigate('/');
navigate('/mypage', { replace: true });
<Navigate to="/" replace />;

// ✅ Good
navigate(ROUTES.HOME);
navigate(ROUTES.MYPAGE, { replace: true });
<Navigate to={ROUTES.HOME} replace />;
```

### `request()` 래퍼 규칙

1. **모든 API 호출은 `request<T>()` 경유** — 직접 `axiosInstance` 사용 금지

   ```typescript
   // ❌ Bad — axiosInstance 직접 사용
   const response = await axiosInstance.get('/api/...');

   // ✅ Good — request() 래퍼 사용
   const data = await request<ResponseType>({
     method: HTTPMethod.GET,
     url: '...',
   });
   ```

2. **헤더 접근 필요 시 `rawResponse: true`**

   ```typescript
   const response = await request<T>({
     method: HTTPMethod.POST,
     url: API_ENDPOINT.USER.SIGN_UP,
     body: data,
     rawResponse: true, // AxiosResponse 전체 반환
   });
   const token = response.headers['access-token'];
   ```

3. **`body` 타입은 `object`** — 인터페이스를 캐스트 없이 직접 전달 가능
4. **모든 bare 함수에 explicit `Promise<T>` 리턴 타입 필수**

### 훅 위치 규칙

| 훅 종류               | 위치                                   | 예시                                   |
| --------------------- | -------------------------------------- | -------------------------------------- |
| API query/mutation 훅 | `apis/queries/` 또는 `apis/mutations/` | `useStackDataQuery`, `useJjymMutation` |
| 순수 상태/UI 훅       | `hooks/` (feature 레벨)                | `useABTest`, `useCurationState`        |

- **`apis/` 아래에 `hooks/` 폴더 금지** — API 폴더에는 queries/mutations만 허용

### shared API 구조

위 "폴더 구조" 섹션의 `shared/apis/ 구조`와 `공유 코드의 배치 기준`을 따른다 (중복 기재하면 한쪽만 낡으므로 여기서는 링크만 둔다 — 2026-08-12 변경).

## Provider 구성

> 2026-08-12 신설. Phase 7에서 작업했으나 문서화가 누락돼 있던 섹션을 현행 코드(`src/main.tsx`) 기준으로 기록한다.

### 마운트 순서

Provider는 **`src/main.tsx`에서만** 추가한다. 페이지·컴포넌트에서 개별 Provider를 감싸지 않는다.

```
createRoot(rootElement, getSentryReactErrorHandlerOptions())
└── ErrorBoundary (AppErrorFallback, onError → upgradeClaritySession('error'))
    └── HelmetProvider
        └── QueryClientProvider (queryClient)
            ├── App  →  RouterProvider (App.tsx)
            ├── MainToaster
            └── ReactQueryDevtools (DEV 전용)
```

순서에 이유가 있는 지점:

- **ErrorBoundary가 가장 바깥** — Provider 자체가 렌더 중 던지는 에러도 잡아야 하므로 Provider보다 위에 있다. 이 경계가 열리면 앱 전체가 폴백 화면으로 바뀐다.
- **`createRoot`의 두 번째 인자** — `getSentryReactErrorHandlerOptions()`가 React 19의 `onCaughtError`·`onUncaughtError`·`onRecoverableError`를 Sentry에 연결한다. 렌더 에러 계측이 여기서 걸리므로 제거하면 조용히 사라진다.
- **초기화 함수는 render 전에 호출** — `initSentry()`·`initClarity()`는 첫 렌더보다 먼저 실행돼야 초기 이벤트를 놓치지 않는다.

### overlay-kit

모달·바텀시트는 `overlay.open()`으로 띄운다. overlay-kit은 Provider를 요구하지 않으므로 main.tsx에 등록하지 않는다.

### StrictMode

현재 **주석 처리 상태**다 (`chore: react strict mode 주석 처리`, 2025-07-10). 커밋 메시지에 사유가 없어 왜 껐는지 코드로는 확인되지 않는다. StrictMode는 개발 모드에서 effect를 두 번 실행해 정리(cleanup) 누락을 드러내는 장치이므로, 다시 켤지는 useEffect 규칙 확정과 함께 판단한다 (5차 단계 4 대상).

---

## 에러 처리 · 로딩 처리 정책

> 자리만 잡아둔 섹션. Phase 10에서 작업했으나 문서화가 누락됐고, 리팩토링 5차에서 정책 표를 확정해 여기에 채운다.
> 확정할 것: 에러 범주(렌더링 / 서버 응답 있음 / 네트워크 / 외부 서비스 / 그 외 비동기) × (유저 표시 / Sentry 보고 / 복구 동작) 정책 표.

지금 확정돼 있는 것만 적으면:

- **API 실패의 Sentry 전송은 `shared/apis/config/globalErrorHandler.ts` 한 곳에서만 한다.** QueryCache·MutationCache의 onError 어댑터를 거치므로 호출부에서 개별 전송하지 않는다 (중복 전송 방지).
- 렌더 에러는 ErrorBoundary 3종으로 받는다: `AppErrorFallback`(앱 전체) / `RouteErrorFallback`(라우트) / `FeatureErrorFallback`(기능 단위).
- 로딩·에러 UI는 공용 컴포넌트를 쓴다: `<Loading />`(전체 또는 `inline`), `<InlineError onRetry>`.

---

## Lazy Loading 컨벤션

### 라우트 분류 기준

| 분류  | 기준                               | 로딩 방식    |
| ----- | ---------------------------------- | ------------ |
| Eager | 첫 진입 확률 높거나 핵심 퍼널 경로 | 정적 import  |
| Lazy  | 특정 조건에서만 방문하는 페이지    | `route.lazy` |

### Eager 페이지 (정적 import) — 5개

`HomePage` · `ImageSetupPage` · `LandingPage` · `LoginPage` · `KakaoCallbackPage`

첫 진입 경로이거나 OAuth 왕복 중간에 있는 페이지들이다.

### Lazy 페이지 (`route.lazy` 패턴) — 13개

```typescript
{
  path: ROUTES.SIGNUP,
  lazy: async () => {
    const { default: SignupPage } = await import('@pages/signup/SignupPage');
    return { Component: SignupPage };
  },
},
```

`SignupPage` · `WelcomePage` · `MyPage` · `SettingPage` · `ProfileEditPage` · `ServicePolicyPage` · `PrivacyPolicyPage` · `StyleListPage` · `StyleDetailPage` · `BannerDetailPage` · `LoadingPage` · `ResultPage` · `NotFoundPage`

> 2026-08-12 정정: 문서에는 `LoadingPage`·`ResultPage`가 eager로, `StartPage`가 lazy로 적혀 있었으나 실제와 달랐다. 앞의 둘은 lazy로 전환됐고 `StartPage`는 삭제됐으며 `LandingPage`가 eager로 추가됐다.
>
> 알려진 한계: `RouterProvider`에 `fallbackElement`가 없어 lazy 페이지를 처음 열 때 로딩 표시 없이 이전 화면이 유지된다.

### RootLayout 위치

- `src/routes/RootLayout.tsx` — router.tsx와 같은 폴더
- `@layout` alias 삭제됨 → 상대경로 import (`./RootLayout`)

<!-- Phase 9 완료 -->

## Vanilla Extract 스타일링 컨벤션

### CSS 속성 순서: Concentric Order

ESLint 플러그인(`@antebudimir/eslint-plugin-vanilla-extract`)이 CSS 속성을 **concentric order**로 자동 정렬한다:

```
바깥 → 안쪽 순서:
position/z-index → display/flex → margin → border → padding → width/height → overflow → font → color → animation
```

- 저장 시 자동 정렬 (`.vscode/settings.json` ESLint autofix)
- 커밋 시에도 husky + lint-staged로 autofix

### 디자인 토큰 사용 규칙

#### 색상

- **모든 색상은 `colorVars`** 사용 (`@styles/tokens/color.css`)
- 하드코딩된 `#hex`, `rgba()` 금지
- 필요한 색상이 없으면 `color.css.ts`에 토큰 추가 후 사용
- 기존 토큰: grayscale (gray000~gray999 + 투명도 변형), brand (primary 계열), feedback (error)

#### 폰트

- **모든 폰트 속성은 `fontVars`** 사용 (`@styles/tokens/font.css`)
- raw `fontSize`, `fontWeight`, `lineHeight` 직접 사용 금지
- `...fontVars.font.body_r_14` 형태로 spread

> 2026-08-12 정정: 이전 문서는 `fontStyle()` 헬퍼를 규칙으로 적고 있었으나, 그 헬퍼는 리팩토링 2차의 폰트 토큰 전환에서 삭제됐다 (현재 `fontStyle` 사용 0건, `fontVars` 225건).

#### 애니메이션·인터랙션

- **키프레임은 `animationTokens`** 사용 (`@styles/tokens/animation.css`)
- **전환·눌림 효과는 interaction 프리셋** 사용 (`@styles/tokens/interaction/presets`) — `pressInteraction`, `sheetSlideInteraction`, `toastShowInteraction` 등. 지속시간을 코드에서 읽어야 하면 같은 파일의 `SHEET_SLIDE_MS` 같은 상수를 쓴다
- `SKELETON_GRADIENT` 상수 — 스켈레톤 로딩 그라데이션 공유값

#### 공유 리터럴

공식 디자인 토큰에 없지만 여러 화면이 같은 값을 쓰는 경우, 토큰을 임의로 신설하지 않고 공용 상수로 뺀다.

- `bottomFadeGradient` (`@styles/gradients`) — 하단 고정 버튼 뒤 흰색 페이드. 5개 페이지가 공유

### 예외 허용 사항

토큰을 쓰지 않고 리터럴을 남겨둔 곳. **새로 추가하려면 이 표에 사유와 함께 등록한다.**

| 항목                                                              | 허용 사유                                                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `global.css.ts:115`의 body box-shadow                             | 미디어쿼리 안 고유값, 1회 사용                                                                  |
| `LoginPage.css.ts:95`의 `#FEE500`                                 | 카카오 브랜드 가이드 색 — 외부 브랜드 값이라 토큰화 대상 아님                                   |
| CSS custom property `vars`의 `'0px'`/`'0%'`                       | `calc()` 연산에 단위 필수                                                                       |
| 카드·내비 오버레이 그라데이션 6곳                                 | 이미지 위 가독성용 검정 반투명. 공식 토큰에 해당 값이 없음                                      |
| `Popup.css.ts:39` / `CommunityComingSoonModal.css.ts:17`의 딤 0.2 | **미정** — 0.2가 의도값인지 디자인팀 확인 대기 (의도값이면 토큰 추가 요청, 아니면 0.3으로 통일) |

> 2026-08-12 정정: 표에 있던 `CtaButton.css.ts`·`BottomSheetWrapper.css.ts` 항목은 두 파일이 모두 삭제돼(리팩토링 2·3차) 제거했다.

### ESLint 규칙 설정 사유

| 규칙                    | 설정    | 사유                                                                        |
| ----------------------- | ------- | --------------------------------------------------------------------------- |
| `concentric-order`      | `error` | CSS 속성 순서 자동 정렬                                                     |
| `no-empty-style-blocks` | `off`   | `recipe()` variant에서 빈 블록(`default: {}`)이 TypeScript 타입 추론에 필요 |
| `no-trailing-zero`      | `error` | 불필요한 후행 0 제거 (ex: `0.50` → `0.5`)                                   |
| `no-zero-unit`          | `off`   | CSS custom property `vars`에서 `'0px'` → `'0'` 변환 시 `calc()` 연산 불가   |
| `no-unknown-unit`       | `error` | 잘못된 CSS 단위 방지                                                        |
| `no-unitless-values`    | `error` | 단위 누락 방지                                                              |

<!-- Phase 11 완료 -->

---

## 변경 이력

| 날짜       | 변경 내용                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-02-16 | 템플릿 생성                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-02-16 | Phase 1: Query Key 컨벤션 추가 (factory 패턴, ESLint 설정)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-02-16 | Phase 2: Path Alias 컨벤션 추가 (@/ 제거, 세부 alias 통일, @store 추가, @types 금지)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-02-17 | Phase 3: 네이밍 컨벤션 추가 ({Feature}Page, Query/Mutation 접미사, 코드 네이밍 규칙)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-02-17 | Phase 3 보완: mypage/login 훅 접미사, 컴포넌트명=파일명 규칙, 폴더 camelCase, dead code 삭제                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-02-17 | Phase 4: 폴더 구조 정규화 (Detection 분리, cross-feature import 해소, steps 리네임)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-02-17 | Phase 4 보완: shared/apis/ 인프라-도메인 분리 (config/ 하위폴더)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-02-17 | Phase 5: Export 컨벤션 추가 (컴포넌트 default, 훅/유틸 named, barrel/mixed 금지)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-02-17 | Phase 6: API/데이터 페칭 컨벤션 추가 (queries/mutations 구조, request() rawResponse, 훅 위치 규칙)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-02-17 | Phase 9: Lazy Loading 컨벤션 추가 (eager/lazy 분류, RootLayout 이동, ONNX preload 정리)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-02-17 | Phase 11: Vanilla Extract 스타일링 컨벤션 추가 (concentric order, 디자인 토큰 규칙, ESLint 플러그인)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-02-17 | 컨벤션 감사: TanStack Query isPending 규칙 추가, 경로 상수 규칙 추가                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-02-17 | P1 핫픽스: 조건부 쿼리(enabled) isPending→isLoading 구분 규칙 추가 (disabled 쿼리 영구 로딩 방지)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-08-12 | 리팩토링 5차: 이 문서를 컨벤션 SSOT로 지정(다른 문서는 포인터만), 새 규칙 채택 기준 4가지 추가. 코드와 어긋난 부분 정정 — 폰트(fontStyle→fontVars), Eager/Lazy 목록, Vanilla Extract 예외 표, 쿼리 도메인 목록, shared/apis 구조. 신설 — Provider 구성(문서화 누락분), 공유 코드 배치 기준, 에러·로딩 정책 섹션(내용은 단계 4에서 확정)                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-08-12 | `@analytics/` alias 추가(사용량 316줄로 최다 — 기존 `@shared/analytics/` 316줄 일괄 치환). analytics barrel 7개 해체로 **`src/` 아래 index.ts 0개 달성**(import 72줄/49파일 치환, 폴더 설명은 README.md로 이전). Detection 모듈 상태 실측 정정 — ONNX 추론은 런타임에 실행되지 않음(prefetch 훅이 빈 함수)                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-08-12 | 규칙마다 "왜 이 규칙인가"를 본문에 추가: query key factory 읽는 법·factory를 쓰는 이유·exhaustive-deps가 검사하는 것과 오탐 조건 / alias 두 규칙의 이유 분리 + alias 목록을 닫음 + 1~2단계 상대경로 허용 근거 / src 최상위 구분과 store 위치 근거 / cross-feature 규칙의 목적 3가지 / default·named export 근거와 barrel 금지 근거(+대가) / TanStack Query 두 축(status·fetchStatus) 설명과 enabled:false에서 갈리는 이유. Detection 모듈 상태를 실측으로 정정(legacy 아님 — 프리페치는 동작 중, hotspot UI만 복구 대기)                                                                                                                                                                                     |
| 2026-08-12 | 규칙 강제 수단 도입(단계 2): "규칙을 무엇이 강제하는가" 섹션 신설(1계층 도구 / 2계층 봇 / 3계층 사람). ESLint에 `no-restricted-imports`(@/ · 최단 alias · 3단계 상대경로 · barrel), `import/no-restricted-paths`(shared·store→pages, 화면 간 교차), `src/**/index.ts` 생성 금지, `react-hooks/exhaustive-deps` error 승격, eslint-plugin-react 등록, 타입 정보를 읽는 규칙군(`projectService`) 추가. tsconfig에 `isolatedModules`·`noImplicitOverride`·`noImplicitReturns`·`noPropertyAccessFromIndexSignature`·`allowUnreachableCode:false`·`allowUnusedLabels:false` 추가. `ImportMetaEnv`에 미선언 환경변수 8개(`VITE_API_BASE_URL` 포함) 추가. knip 도입 + CI에 lint job 추가                            |
| 2026-08-18 | **ONNX 가구 탐지 모듈 삭제** (팀 합의). 31파일 + 바이너리 53MB + `onnxruntime-web` 제거. 살아 있던 참조 3곳 정리(useUserStore 캐시 clear / GeneratedImagesSection prefetch 로직 / queryKey의 furniture 도메인). 복구 절차는 "Detection 모듈" 절에 기록. 남아 있는 큐레이션(v2 추천형)은 무관. 삭제로 `noUncheckedIndexedAccess` 위반이 75건→9건이 되어 9건을 고치고 플래그를 채택했고, knip 미사용 파일이 0이 되어 CI 게이트에 파일 검사를 추가했다 손으로 고른 규칙 24개를 typescript-eslint 표준 프리셋 `recommendedTypeChecked`로 교체(위반 11건 처리 — 그중 `no-unsafe-enum-comparison` 4건은 react-router `NavigationType` enum을 문자열 리터럴과 비교하던 것). `strictTypeChecked`는 234건이라 미채택. |
