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
