# Component Catalog

## 한글 자연어 요약

### 공용 네비게이션 & 헤더

- `src/shared/components/navBar/LogoNavBar.tsx`는 로그인/프로필 상태에 따라 버튼을 토글하고 `ROUTES`를 이용해 내비게이션을 제어합니다.
- `src/shared/components/navBar/TitleNavBar.tsx`는 페이지별 제목, 뒤로가기, 설정/로그인 버튼을 조건부로 렌더링하며 내부 페이지에서 공통으로 사용됩니다.

### 버튼 스택

- `src/shared/components/button` 하위 디렉터리는 CTA, Like, Save, Flip, Charge, Filled, Error 계열 버튼을 variant recipe 패턴으로 분류합니다.
- 각 버튼은 Vanilla Extract recipe로 상태(활성/비활성/선택), 사이즈, 타입 변형을 정의해 디자인 토큰 반영이 쉽습니다.

### 입력 & 폼 요소

- `src/shared/components/textField/TextField.tsx`는 controlled/uncontrolled 하이브리드 패턴을 지원하고 focus/error 상태를 CSS variant로 노출합니다.
- `signup`/`imageSetup` 등의 폼 페이지는 텍스트 필드와 공통 버튼/캡션 컴포넌트를 조합해 재사용성을 유지합니다.

### 정보 카드 & 피드백

- `src/shared/components/card`, `cardReview`, `cardImage`, `cardHistory`는 이미지/텍스트 카드 UI를 모듈화해 도메인별 재사용에 맞춰 분리되어 있습니다.
- `src/shared/components/loading/Loading.tsx`, `src/shared/components/text/HeadingText.tsx`, `src/shared/components/divider/Divider.tsx` 등 상태 전달용 컴포넌트도 폴더 단위로 분리되어 있습니다.

### Toast & Overlay

- `src/shared/components/toast`는 `Toast` 프레젠테이션, `useToast` 훅, 테스트 컴포넌트를 포함합니다.
- `src/shared/components/overlay/{modal,popup}`는 모달/팝업 오버레이 UI를 담당합니다.

### Bottom Sheet & Drag UX

- `src/shared/components/bottomSheet/BottomSheetWrapper.tsx`는 스냅 상태, 드래그 핸들, backdrop을 재사용 가능한 래퍼로 제공합니다.
- 관련 시트 컴포넌트(`flipSheet`, `noMatchSheet`)와 페이지 단위 시트가 이를 조합해 사용합니다.

### 도메인 전용 섹션

- `src/pages/home/components/*`: 랜딩 섹션 컴포넌트(인트로/가이드/리뷰)를 분리 관리합니다.
- `src/pages/imageSetup/components/*`: 퍼널 전용 헤더/레이아웃/버튼그룹/캡션 컴포넌트를 제공합니다.
- `src/pages/generate/pages/result/components/*`: 결과 페이지 전용 이미지/핫스팟 컴포넌트를 제공합니다.
- `src/pages/mypage/components/*`: 마이페이지 전용 프로필/저장항목/생성이력/네비게이션 컴포넌트를 제공합니다.

### Storybook 커버리지

- 스토리 파일은 기본적으로 `src/stories/*.stories.tsx`에 위치하며 공통 컴포넌트 시각 검증에 사용됩니다.

This document records the current UI component structure in the repository.
It is intended to be used as implementation context for UI work.

## Scan Scope

- Target path pattern: `src/**/components/**`
- Scan unit: files under each directory named `components`
- Current roots are listed in the Snapshot section below

## Include Rules

- Include: `*.tsx`, `*.ts`, `*.jsx`, `*.js`, `*.css.ts`, `*.css`

## Exclude Rules

- Exclude: `*.stories.*`, `*.test.*`, `*.spec.*`
- Exclude non-file entries and unsupported extensions

## Last Updated Criteria

- Update this document when files are created, moved, renamed, or deleted under `src/**/components/**`.
- Update this document when include/exclude scan rules are changed.
- Update this document when a new `components` root is added or removed.
- If no structure/rule change occurred, this document does not need an update.

## Snapshot

- generated_at: `2026-02-17T16:31:11.447Z`
- component_roots: 8
- component_files: 132

## Component Roots

- `src/pages/generate/components`
- `src/pages/generate/pages/result/components`
- `src/pages/home/components`
- `src/pages/imageSetup/components`
- `src/pages/login/components`
- `src/pages/mypage/components`
- `src/pages/signup/components`
- `src/shared/components`

## Tree

### `src/pages/generate/components`

```text
src/pages/generate/components/
└─ filterChip/
   ├─ FilterChip.css.ts
   └─ FilterChip.tsx
```

### `src/pages/generate/pages/result/components`

```text
src/pages/generate/pages/result/components/
├─ DetectionHotspots.css.ts
├─ DetectionHotspots.tsx
├─ GeneratedImg.css.ts
├─ GeneratedImgA.tsx
└─ GeneratedImgB.tsx
```

### `src/pages/home/components`

```text
src/pages/home/components/
├─ AnimatedSection.tsx
├─ introSection/
│  ├─ IntroSection.css.ts
│  └─ IntroSection.tsx
├─ reviewSection/
│  ├─ ReviewSection.css.ts
│  └─ ReviewSection.tsx
└─ stepGuideSection/
   ├─ StepGuideSection.css.ts
   └─ StepGuideSection.tsx
```

### `src/pages/imageSetup/components`

```text
src/pages/imageSetup/components/
├─ buttonGroup/
│  ├─ ButtonGroup.css.ts
│  └─ ButtonGroup.tsx
├─ caption/
│  ├─ Caption.css.ts
│  ├─ Caption.tsx
│  ├─ CaptionChip.css.ts
│  └─ CaptionChip.tsx
├─ header/
│  ├─ FunnelHeader.css.ts
│  └─ FunnelHeader.tsx
├─ headingText/
│  ├─ HeadingText.css.ts
│  └─ HeadingText.tsx
└─ layout/
   ├─ FunnelLayout.css.ts
   └─ FunnelLayout.tsx
```

### `src/pages/login/components`

```text
src/pages/login/components/
├─ LogoutButton.tsx
└─ TokenRefreshTest.tsx
```

### `src/pages/mypage/components`

```text
src/pages/mypage/components/
├─ button/
│  ├─ curationButton/
│  │  ├─ CurationButton.css.ts
│  │  └─ CurationButton.tsx
│  └─ smallButton/
│     ├─ SmallButton.css.ts
│     └─ SmallButton.tsx
├─ card/
│  └─ cardCuration/
│     ├─ CardCuration.css.ts
│     └─ CardCuration.tsx
├─ history/
│  ├─ HistorySection.css.ts
│  └─ HistorySection.tsx
├─ navBar/
│  ├─ TabNavBar.css.ts
│  └─ TabNavBar.tsx
└─ section/
   ├─ emptyState/
   │  ├─ EmptyStateSection.css.ts
   │  └─ EmptyStateSection.tsx
   ├─ generatedImages/
   │  ├─ GeneratedImagesSection.css.ts
   │  └─ GeneratedImagesSection.tsx
   ├─ profile/
   │  ├─ ProfileSection.css.ts
   │  └─ ProfileSection.tsx
   └─ savedItems/
      ├─ SavedItemsSection.css.ts
      └─ SavedItemsSection.tsx
```

### `src/pages/signup/components`

_No matching files under this root based on current include/exclude rules._

### `src/shared/components`

```text
src/shared/components/
├─ bottomSheet/
│  ├─ BottomSheetWrapper.css.ts
│  ├─ BottomSheetWrapper.tsx
│  ├─ flipSheet/
│  │  ├─ FlipSheet.css.ts
│  │  └─ FlipSheet.tsx
│  └─ noMatchSheet/
│     ├─ NoMatchSheet.css.ts
│     └─ NoMatchSheet.tsx
├─ button/
│  ├─ chargeButton/
│  │  ├─ ChargeButton.css.ts
│  │  └─ ChargeButton.tsx
│  ├─ ctaButton/
│  │  ├─ CtaButton.css.ts
│  │  └─ CtaButton.tsx
│  ├─ ErrorButton/
│  │  ├─ ErrorButton.css.ts
│  │  └─ ErrorMessage.tsx
│  ├─ flipButton/
│  │  ├─ FlipButton.css.ts
│  │  └─ FlipButton.tsx
│  ├─ largeFilledButton/
│  │  ├─ LargeFilledButton.css.ts
│  │  └─ LargeFilledButton.tsx
│  ├─ likeButton/
│  │  ├─ DislikeButton.tsx
│  │  ├─ LikeButton.css.ts
│  │  └─ LikeButton.tsx
│  ├─ linkButton/
│  │  ├─ LinkButton.css.ts
│  │  └─ LinkButton.tsx
│  ├─ noMatchButton/
│  │  ├─ NoMatchButton.css.ts
│  │  └─ NoMatchButton.tsx
│  ├─ saveButton/
│  │  ├─ SaveButton.css.ts
│  │  └─ SaveButton.tsx
│  └─ smallFilledButton/
│     ├─ SmallFilledButton.css.ts
│     └─ SmallFilledButton.tsx
├─ card/
│  ├─ cardHistory/
│  │  ├─ CardHistory.css.ts
│  │  └─ CardHistory.tsx
│  ├─ cardImage/
│  │  ├─ CardImage.css.ts
│  │  ├─ CardImage.tsx
│  │  └─ SkeletonCardImage.tsx
│  ├─ cardProduct/
│  │  ├─ CardProduct.css.ts
│  │  └─ CardProduct.tsx
│  └─ floorCard/
│     ├─ FloorCard.css.ts
│     └─ FloorCard.tsx
├─ cardReview/
│  ├─ CardReview.css.ts
│  └─ CardReview.tsx
├─ creditBox/
│  ├─ CreditBox.css.ts
│  └─ CreditBox.tsx
├─ creditChip/
│  ├─ CreditChip.css.ts
│  └─ CreditChip.tsx
├─ divider/
│  ├─ Divider.css.ts
│  └─ Divider.tsx
├─ dragHandle/
│  ├─ DragHandle.css.ts
│  └─ DragHandle.tsx
├─ errorFallback/
│  ├─ AppErrorFallback.css.ts
│  ├─ AppErrorFallback.tsx
│  ├─ ErrorIllustration.css.ts
│  ├─ ErrorIllustration.tsx
│  ├─ FeatureErrorFallback.css.ts
│  ├─ FeatureErrorFallback.tsx
│  ├─ RouteErrorFallback.css.ts
│  └─ RouteErrorFallback.tsx
├─ inlineError/
│  ├─ InlineError.css.ts
│  └─ InlineError.tsx
├─ loading/
│  ├─ Loading.css.ts
│  └─ Loading.tsx
├─ lottie/
│  └─ LoadingLottie.tsx
├─ navBar/
│  ├─ LogoNavBar.css.ts
│  ├─ LogoNavBar.tsx
│  ├─ NavBtn.css.ts
│  ├─ TitleNavBar.css.ts
│  └─ TitleNavBar.tsx
├─ overlay/
│  ├─ modal/
│  │  ├─ CreditModal.css.ts
│  │  ├─ CreditModal.tsx
│  │  ├─ GeneralModal.css.ts
│  │  ├─ GeneralModal.tsx
│  │  ├─ GeneralModalTest.tsx
│  │  └─ OverlayTest.tsx
│  └─ popup/
│     ├─ Popup.css.ts
│     ├─ Popup.tsx
│     └─ PopupTest.tsx
├─ progressBarKey/
│  ├─ ProgressBarKey.css.ts
│  ├─ ProgressBarKey.tsx
│  └─ ProgressBarKey.types.ts
├─ text/
│  ├─ HeadingText.css.ts
│  └─ HeadingText.tsx
├─ textField/
│  ├─ TextField.css.ts
│  └─ TextField.tsx
├─ titleStep/
│  ├─ TitleStep.css.ts
│  └─ TitleStep.tsx
└─ toast/
   ├─ Toast.css.ts
   ├─ Toast.tsx
   ├─ ToastTest.tsx
   └─ useToast.tsx
```
