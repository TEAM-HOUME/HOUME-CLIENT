// MyPage 페이지 관련 Firebase Analytics 이벤트

import { logAnalyticsEvent } from '@/shared/utils/analytics';

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
  logAnalyticsEvent('mypage_click_tabImg');
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
  logAnalyticsEvent('mypage_click_tabFurniture');
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
  logAnalyticsEvent('mypage_click_btnImgCard');
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
  logAnalyticsEvent('mypage_click_btnFurnitureCard');
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
  logAnalyticsEvent('mypage_click_btnMakeImg');
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
  logAnalyticsEvent('mypage_click_btnLogout');
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
  logAnalyticsEvent('mypage_click_btnSuccession');
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
  logAnalyticsEvent('mypage_click_successionModalOut');
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
  logAnalyticsEvent('mypage_click_successionModalCancel');
};
