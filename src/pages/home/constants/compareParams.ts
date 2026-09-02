import { ROUTES } from '@routes/paths';

import type { HomeTab } from '@shared/types/tabNavigation';

/**
 * 진행 중인 비교를 가리키는 URL 쿼리 파라미터 이름 (`/?tab=compare&jobId=xxx`)
 */
export const COMPARE_JOB_ID_PARAM = 'jobId';

/**
 * DeepLinkRoute에서 상품 URL을 복원
 * → URL 쿼리 파라미터에 상품 URL 추가
 * → CompareTab이 읽어 입력창을 채움
 * → job이 생성되면 ?productUrl=...은 지우고 ?jobId=... 추가
 */
export const COMPARE_PRODUCT_URL_PARAM = 'productUrl';

/**
 * 프리셋 고정 결과를 가리키는 URL 쿼리 파라미터 이름 (`/?tab=compare&presetId=1`)
 */
export const COMPARE_PRESET_ID_PARAM = 'presetId';

const TAB_PARAM = 'tab';
const COMPARE_TAB: HomeTab = 'compare';

/**
 * 비교 탭 주소를 만든다.
 *
 * 딥링크 진입과 로그인 복귀 경로가 같은 문자열을 써야 해서 한곳에 모았다.
 * 두 곳에서 따로 조립하면 파라미터 이름을 바꿀 때 한쪽만 고쳐도 티가 안 난다.
 */
export const buildCompareTabPath = (productUrl?: string): string => {
  const base = `${ROUTES.HOME}?${TAB_PARAM}=${COMPARE_TAB}`;

  return productUrl
    ? `${base}&${COMPARE_PRODUCT_URL_PARAM}=${encodeURIComponent(productUrl)}`
    : base;
};

/** 탐색 위젯·딥링크 등에서 프리셋 고정 결과 화면으로 진입할 때 쓴다 */
export const buildComparePresetTabPath = (presetId: number): string =>
  `${ROUTES.HOME}?${TAB_PARAM}=${COMPARE_TAB}&${COMPARE_PRESET_ID_PARAM}=${presetId}`;
