// 담당: 비로그인 → 보호 라우트 접근 → 카카오 로그인 → 원래 가려던 곳으로 복귀

const STORAGE_KEY = 'loginRedirect';

/**
 * 로그인 필요 시점에 로그인 후 복귀할 경로 저장
 * 카카오 로그인 시 window.location.href로 페이지가 완전히 이동하여 React 상태가 소멸되므로 sessionStorage 사용
 */
export const setLoginRedirect = (path: string): void => {
  sessionStorage.setItem(STORAGE_KEY, path);
};

/**
 * WelcomePage CTA 분기 판단용
 * 마이페이지 → WelcomePage: CTA에 '홈에서 시작하기' 띄우기
 * 그 외 → WelcomePage: CTA에 '계속해서 이미지 생성하기' 띄우기
 * CTA를 누르면 consumeLoginRedirect 실행 → 실제 리다이렉트 진행
 */
export const getLoginRedirect = (): string | null => {
  return sessionStorage.getItem(STORAGE_KEY);
};

/**
 * 로그인 성공 시 저장된 복귀 경로를 읽고 삭제
 * 없으면 null 반환
 */
export const consumeLoginRedirect = (): string | null => {
  const path = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  return path;
};
