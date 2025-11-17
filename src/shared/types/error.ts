// 에러 타입 정의
export type ErrorType = 'loading' | 'api' | 'auth' | 'network' | 'validation';

// 페이지 컨텍스트 정의
export type PageContext =
  | 'home'
  | 'imageSetup'
  | 'generate'
  | 'mypage'
  | 'login';

// 에러 타입별 메시지 매핑
export const ERROR_MESSAGES: Record<ErrorType, string> = {
  loading: '불러오는 중 오류가 발생했습니다.',
  api: '요청 중 오류가 발생했습니다.',
  network: '네트워크 연결을 확인해주세요.',
  auth: '로그인이 필요합니다.',
  validation: '입력 정보를 확인해주세요.',
};
