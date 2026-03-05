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
 * 로그인 성공 시 저장된 복귀 경로를 읽고 삭제
 * 없으면 null 반환
 */
export const consumeLoginRedirect = (): string | null => {
  const path = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  return path;
};
