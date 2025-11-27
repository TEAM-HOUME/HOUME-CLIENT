// ResultImg 페이지 관련 Firebase Analytics 이벤트

import { logAnalyticsEvent } from '@/shared/utils/analytics';

import type { ImageGenerationVariant } from '../hooks/useABTest';

/**
 * ResultImg 슬라이드 왼쪽 스와이프 이벤트
 *
 * 이벤트 코드: resultImg_swipe_slideLeft
 * - Page: resultImg
 * - Action: swipe
 * - Component: slide
 * - Function: Left
 *
 * 이미지 슬라이드를 왼쪽으로 스와이프할 때 전송
 *
 * @param variant - A/B 테스트 그룹 ('single' | 'multiple')
 */
export const logResultImgSwipeSlideLeft = (variant: ImageGenerationVariant) => {
  logAnalyticsEvent('resultImg_swipe_slideLeft', { ab_variant: variant });
};

/**
 * ResultImg 슬라이드 오른쪽 스와이프 이벤트
 *
 * 이벤트 코드: resultImg_swipe_slideRight
 * - Page: resultImg
 * - Action: swipe
 * - Component: slide
 * - Function: Right
 *
 * 이미지 슬라이드를 오른쪽으로 스와이프할 때 전송
 */
export const logResultImgSwipeSlideRight = (
  variant: ImageGenerationVariant
) => {
  logAnalyticsEvent('resultImg_swipe_slideRight', { ab_variant: variant });
};

/**
 * ResultImg 스팟 버튼 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_btnSpot
 * - Page: resultImg
 * - Action: click
 * - Component: btn
 * - Function: Spot
 *
 * 스팟 버튼 클릭 시 전송
 */
export const logResultImgClickBtnSpot = (variant: ImageGenerationVariant) => {
  logAnalyticsEvent('resultImg_click_btnSpot', { ab_variant: variant });
};

/**
 * ResultImg 더보기 버튼 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_btnMoreImg
 * - Page: resultImg
 * - Action: click
 * - Component: btn
 * - Function: MoreImg
 *
 * 더보기 버튼 클릭 시 전송
 */
export const logResultImgClickBtnMoreImg = (
  variant: ImageGenerationVariant
) => {
  logAnalyticsEvent('resultImg_click_btnMoreImg', { ab_variant: variant });
};

/**
 * ResultImg 더보기 모달 뒤로가기 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_moreModalBack
 * - Page: resultImg
 * - Action: click
 * - Component: moreModal
 * - Function: Back
 *
 * 더보기 모달에서 뒤로가기 버튼 클릭 시 전송
 */
export const logResultImgClickMoreModalBack = (
  variant: ImageGenerationVariant
) => {
  logAnalyticsEvent('resultImg_click_moreModalBack', { ab_variant: variant });
};

/**
 * ResultImg 더보기 모달 새로 만들기 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_moreModalMakeNew
 * - Page: resultImg
 * - Action: click
 * - Component: moreModal
 * - Function: MakeNew
 *
 * 더보기 모달에서 새로 만들기 버튼 클릭 시 전송
 */
export const logResultImgClickMoreModalMakeNew = (
  variant: ImageGenerationVariant
) => {
  logAnalyticsEvent('resultImg_click_moreModalMakeNew', {
    ab_variant: variant,
  });
};

/**
 * ResultImg 태그 버튼 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_btnTag
 * - Page: resultImg
 * - Action: click
 * - Component: btn
 * - Function: Tag
 *
 * 태그 버튼 클릭 시 전송
 */
export const logResultImgClickBtnTag = (variant: ImageGenerationVariant) => {
  logAnalyticsEvent('resultImg_click_btnTag', { ab_variant: variant });
};

/**
 * ResultImg 큐레이션 시트 위로 스와이프 이벤트
 *
 * 이벤트 코드: resultImg_swipe_curationSheetUp
 * - Page: resultImg
 * - Action: swipe
 * - Component: curationSheet
 * - Function: Up
 *
 * 큐레이션 시트를 위로 스와이프할 때 전송
 */
export const logResultImgSwipeCurationSheetUp = (
  variant: ImageGenerationVariant
) => {
  logAnalyticsEvent('resultImg_swipe_curationSheetUp', { ab_variant: variant });
};

/**
 * ResultImg 큐레이션 시트 아래로 스와이프 이벤트
 *
 * 이벤트 코드: resultImg_swipe_curationSheetDown
 * - Page: resultImg
 * - Action: swipe
 * - Component: curationSheet
 * - Function: Down
 *
 * 큐레이션 시트를 아래로 스와이프할 때 전송
 */
export const logResultImgSwipeCurationSheetDown = (
  variant: ImageGenerationVariant
) => {
  logAnalyticsEvent('resultImg_swipe_curationSheetDown', {
    ab_variant: variant,
  });
};

/**
 * ResultImg 큐레이션 시트 가구 필터 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_curationSheetFilter
 * - Page: resultImg
 * - Action: click
 * - Component: curationSheet
 * - Function: FilterFurniture
 *
 * 큐레이션 시트에서 가구 필터 클릭 시 전송
 */
export const logResultImgClickCurationSheetFilter = (
  variant: ImageGenerationVariant
) => {
  logAnalyticsEvent('resultImg_click_curationSheetFilter', {
    ab_variant: variant,
  });
};

/**
 * ResultImg 큐레이션 시트 사이트 이동 버튼 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_curationSheetBtnGoSite
 * - Page: resultImg
 * - Action: click
 * - Component: curationSheet
 * - Function: BtnGoSite
 *
 * 큐레이션 시트에서 사이트 이동 버튼 클릭 시 전송
 */
export const logResultImgClickCurationSheetBtnGoSite = (
  variant: ImageGenerationVariant
) => {
  logAnalyticsEvent('resultImg_click_curationSheetBtnGoSite', {
    ab_variant: variant,
  });
};

/**
 * ResultImg 큐레이션 시트 저장 버튼 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_curationSheetBtnSave
 * - Page: resultImg
 * - Action: click
 * - Component: curationSheet
 * - Function: BtnSave
 *
 * 큐레이션 시트에서 저장 버튼 클릭 시 전송
 */
export const logResultImgClickCurationSheetBtnSave = (
  variant: ImageGenerationVariant
) => {
  logAnalyticsEvent('resultImg_click_curationSheetBtnSave', {
    ab_variant: variant,
  });
};

/**
 * ResultImg 큐레이션 시트 카드 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_curationSheetCard
 * - Page: resultImg
 * - Action: click
 * - Component: curationSheet
 * - Function: Card
 *
 * 큐레이션 시트에서 카드 클릭 시 전송
 */
export const logResultImgClickCurationSheetCard = (
  variant: ImageGenerationVariant
) => {
  logAnalyticsEvent('resultImg_click_curationSheetCard', {
    ab_variant: variant,
  });
};

/**
 * 이미지 생성 시작 페이지 CTA 버튼 클릭 이벤트
 *
 * 이벤트 코드: generateStart_click_btnCTA
 * - Page: generateStart
 * - Action: click
 * - Component: btnCTA
 * - Function: (없음)
 *
 * CTA 버튼: "이미지 만들러가기" 버튼
 */
export const logGenerateStartClickBtnCTA = (
  variant: ImageGenerationVariant
) => {
  logAnalyticsEvent('generateStart_click_btnCTA', { ab_variant: variant });
};
