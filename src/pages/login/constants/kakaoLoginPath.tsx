/**
 * @deprecated 이 파일은 더 이상 사용되지 않습니다.
 *
 * 기존 방식:
 * - 프론트엔드에서 고정된 redirect_uri로 카카오 인증 URL 직접 생성
 * - 환경 변수(VITE_KAKAO_REDIRECT_URI)로 redirect_uri 고정
 *
 * 변경된 방식:
 * - 백엔드 `/oauth/kakao` 엔드포인트로 리다이렉트
 * - 백엔드가 env 쿼리 파라미터를 기반으로 동적으로 redirect_uri 계산
 * - Origin 헤더 대신 env 파라미터로 환경 구분 (local/dev)
 *
 * 참고:
 * - 현재는 LoginPage에서 백엔드 `/oauth/kakao?env=local&prompt=login`로 리다이렉트
 * - 백엔드가 카카오 인증 URL을 생성하고 리다이렉트 처리
 *
 * @see src/pages/login/LoginPage.tsx
 * @see src/pages/login/apis/kakaoLogin.ts
 */
const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_KAKAO_REDIRECT_URI;
if (!clientId || !redirectUrl) {
  throw new Error('카카오 로그인 환경 변수가 설정되지 않았습니다.');
}
const kakaoAuthUrl = new URL('https://kauth.kakao.com/oauth/authorize');
kakaoAuthUrl.searchParams.set('client_id', clientId);
kakaoAuthUrl.searchParams.set('redirect_uri', redirectUrl);
kakaoAuthUrl.searchParams.set('response_type', 'code');
kakaoAuthUrl.searchParams.set('scope', 'profile_nickname,account_email');
// prompt=login: 항상 로그인 화면을 보여줌 (기존 카카오 세션 무시)
kakaoAuthUrl.searchParams.set('prompt', 'login');
export const KAKAO_AUTH_URL = kakaoAuthUrl.toString();
