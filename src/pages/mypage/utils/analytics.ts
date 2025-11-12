/**
 * MyPage 페이지 관련 Firebase Analytics 이벤트
 *
 * 이벤트 코드 규칙: {Page}_{Action}_{Component}_{Function}
 * - Page: mypage
 * - Action: click, view 등
 * - Component: tab, btn, successionModal 등
 * - Function: Img, Furniture, ImgCard, FurnitureCard, MakeImg, Logout, Succession, Out, Cancel 등
 *
 * 이벤트 코드:
 * - mypage_click_tabImg
 * - mypage_click_tabFurniture
 * - mypage_click_btnImgCard
 * - mypage_click_btnFurnitureCard
 * - mypage_click_btnMakeImg
 * - mypage_click_btnLogout
 * - mypage_click_btnSuccession
 * - mypage_click_successionModalOut
 * - mypage_click_successionModalCancel
 *
 */

import { logEvent } from 'firebase/analytics';

import { analytics } from '@/shared/config/firebase';

/**
 * MyPage 탭 Img 클릭 이벤트
 *
 * 이벤트 코드: mypage_click_tabImg
 * - Page: mypage
 * - Action: click
 * - Component: tab
 * - Function: Img
 *
 * "생성된 이미지" 탭 클릭 시 전송
 */
export const logMyPageClickTabImg = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'mypage_click_tabImg', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] mypage_click_tabImg 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * MyPage 탭 Furniture 클릭 이벤트
 *
 * 이벤트 코드: mypage_click_tabFurniture
 * - Page: mypage
 * - Action: click
 * - Component: tab
 * - Function: Furniture
 *
 * "찜한 가구" 탭 클릭 시 전송
 */
export const logMyPageClickTabFurniture = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'mypage_click_tabFurniture', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] mypage_click_tabFurniture 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * MyPage 이미지 카드 버튼 클릭 이벤트
 *
 * 이벤트 코드: mypage_click_btnImgCard
 * - Page: mypage
 * - Action: click
 * - Component: btn
 * - Function: ImgCard
 *
 * 생성된 이미지 카드 클릭 시 전송
 */
export const logMyPageClickBtnImgCard = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'mypage_click_btnImgCard', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] mypage_click_btnImgCard 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * MyPage 가구 카드 버튼 클릭 이벤트
 *
 * 이벤트 코드: mypage_click_btnFurnitureCard
 * - Page: mypage
 * - Action: click
 * - Component: btn
 * - Function: FurnitureCard
 *
 * 찜한 가구 카드 클릭 시 전송
 */
export const logMyPageClickBtnFurnitureCard = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'mypage_click_btnFurnitureCard', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] mypage_click_btnFurnitureCard 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * MyPage 이미지 만들기 버튼 클릭 이벤트
 *
 * 이벤트 코드: mypage_click_btnMakeImg
 * - Page: mypage
 * - Action: click
 * - Component: btn
 * - Function: MakeImg
 *
 * "이미지 만들러 가기" 버튼 클릭 시 전송
 */
export const logMyPageClickBtnMakeImg = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'mypage_click_btnMakeImg', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] mypage_click_btnMakeImg 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * MyPage 로그아웃 버튼 클릭 이벤트
 *
 * 이벤트 코드: mypage_click_btnLogout
 * - Page: mypage
 * - Action: click
 * - Component: btn
 * - Function: Logout
 *
 * 로그아웃 버튼 클릭 시 전송
 */
export const logMyPageClickBtnLogout = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'mypage_click_btnLogout', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] mypage_click_btnLogout 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * MyPage 탈퇴하기 버튼 클릭 이벤트
 *
 * 이벤트 코드: mypage_click_btnSuccession
 * - Page: mypage
 * - Action: click
 * - Component: btn
 * - Function: Succession
 *
 * 탈퇴하기 버튼 클릭 시 전송
 */
export const logMyPageClickBtnSuccession = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'mypage_click_btnSuccession', {
      page_path: window.location.pathname,
    });
    console.log('[Firebase Analytics] mypage_click_btnSuccession 이벤트 전송');
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * MyPage 탈퇴 모달 Out 클릭 이벤트
 *
 * 이벤트 코드: mypage_click_successionModalOut
 * - Page: mypage
 * - Action: click
 * - Component: successionModal
 * - Function: Out
 *
 * 탈퇴 모달에서 "탈퇴하기" 버튼 클릭 시 전송
 */
export const logMyPageClickSuccessionModalOut = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'mypage_click_successionModalOut', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] mypage_click_successionModalOut 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};

/**
 * MyPage 탈퇴 모달 Cancel 클릭 이벤트
 *
 * 이벤트 코드: mypage_click_successionModalCancel
 * - Page: mypage
 * - Action: click
 * - Component: successionModal
 * - Function: Cancel
 *
 * 탈퇴 모달에서 "취소하기" 버튼 클릭 시 전송
 */
export const logMyPageClickSuccessionModalCancel = () => {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics 초기화 실패');
    return;
  }

  try {
    logEvent(analytics, 'mypage_click_successionModalCancel', {
      page_path: window.location.pathname,
    });
    console.log(
      '[Firebase Analytics] mypage_click_successionModalCancel 이벤트 전송'
    );
  } catch (error) {
    console.error('Analytics logEvent 오류:', error);
  }
};
