/**
 * ResultImg 페이지 관련 Firebase Analytics 이벤트
 *
 * 이벤트 코드 규칙: {Page}_{Action}_{Component}_{Function}
 * - Page: resultImg
 * - Action: click, swipe 등
 * - Component: slide, btn, moreModal, curationSheet 등
 * - Function: Left, Right, Spot, MoreImg, Back, MakeNew, Tag, Up, Down, FilterFurniture, BtnGoSite, BtnSave, Card 등
 *
 * 이벤트 코드:
 * - resultImg_swipe_slideLeft
 * - resultImg_swipe_slideRight
 * - resultImg_click_btnSpot
 * - resultImg_click_btnMoreImg
 * - resultImg_click_moreModalBack
 * - resultImg_click_moreModalMakeNew
 * - resultImg_click_btnTag
 * - resultImg_swipe_curationSheetUp
 * - resultImg_swipe_curationSheetDown
 * - resultImg_click_curationSheetFilterFurniture
 * - resultImg_click_curationSheetBtnGoSite
 * - resultImg_click_curationSheetBtnSave
 * - resultImg_click_curationSheetCard
 *
 */

import { logEvent } from 'firebase/analytics';

import { analytics } from '@/shared/config/firebase';

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
 */
export const logResultImgSwipeSlideLeft = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_swipe_slideLeft', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] resultImg_swipe_slideLeft 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
export const logResultImgSwipeSlideRight = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_swipe_slideRight', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] resultImg_swipe_slideRight 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
export const logResultImgClickBtnSpot = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_click_btnSpot', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] resultImg_click_btnSpot 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
export const logResultImgClickBtnMoreImg = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_click_btnMoreImg', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] resultImg_click_btnMoreImg 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
export const logResultImgClickMoreModalBack = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_click_moreModalBack', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] resultImg_click_moreModalBack 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
export const logResultImgClickMoreModalMakeNew = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_click_moreModalMakeNew', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] resultImg_click_moreModalMakeNew 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
export const logResultImgClickBtnTag = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_click_btnTag', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] resultImg_click_btnTag 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
export const logResultImgSwipeCurationSheetUp = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_swipe_curationSheetUp', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] resultImg_swipe_curationSheetUp 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
export const logResultImgSwipeCurationSheetDown = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_swipe_curationSheetDown', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] resultImg_swipe_curationSheetDown 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * ResultImg 큐레이션 시트 가구 필터 클릭 이벤트
 *
 * 이벤트 코드: resultImg_click_curationSheetFilterFurniture
 * - Page: resultImg
 * - Action: click
 * - Component: curationSheet
 * - Function: FilterFurniture
 *
 * 큐레이션 시트에서 가구 필터 클릭 시 전송
 */
export const logResultImgClickCurationSheetFilterFurniture = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_click_curationSheetFilterFurniture', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] resultImg_click_curationSheetFilterFurniture 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
export const logResultImgClickCurationSheetBtnGoSite = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_click_curationSheetBtnGoSite', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] resultImg_click_curationSheetBtnGoSite 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
export const logResultImgClickCurationSheetBtnSave = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_click_curationSheetBtnSave', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] resultImg_click_curationSheetBtnSave 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
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
export const logResultImgClickCurationSheetCard = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'resultImg_click_curationSheetCard', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] resultImg_click_curationSheetCard 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};
