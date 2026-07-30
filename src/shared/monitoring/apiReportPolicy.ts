import { API_ERROR_KIND, type ApiErrorInfo } from './classifyApiError';
import { shouldSample } from './sampling';

/**
 * API 에러 전송 정책
 *
 * 무엇을 Sentry로 보내고 무엇을 버릴지 정한다.
 * 버리는 경우에도 호출부는 breadcrumb를 남기므로 맥락은 보존된다.
 */

/**
 * 4xx 중에서도 캡처할 서버 비즈니스 에러 코드 (allowlist)
 *
 * 4xx는 기본 미전송이고 여기 등록된 것만 보낸다.
 * (denylist로 하면 서버에 새 에러 코드가 생길 때마다 quota가 새기 때문)
 */
export const CAPTURED_CLIENT_ERROR_CODES = new Set<number>([
  // 이미지 생성 잘못된 요청 — 클라이언트가 조립한 payload 오류이므로 앱 버그
  50400,
]);

/** 네트워크 에러 샘플링 비율 (조회는 대량이라 일부만, 변경 요청은 전량) */
const NETWORK_QUERY_SAMPLE_RATE = 0.1;
/** 인증 실패(401/403) 샘플링 비율 */
const AUTH_STATUS_SAMPLE_RATE = 0.1;

/** query/mutation 단위로 정책을 덮어쓰는 모드 */
export type ApiCaptureMode = 'auto' | 'always' | 'never';

export interface ApiReportDecision {
  level: 'error' | 'warning';
  fingerprint: string[];
}

/** 엔드포인트 + 상태 + 비즈니스 코드 단위로 이슈를 묶는다 */
const buildFingerprint = (info: ApiErrorInfo): string[] => [
  'api',
  info.kind,
  info.method ?? '-',
  info.routePattern ?? '-',
  info.status !== undefined ? String(info.status) : '-',
  info.code !== undefined ? String(info.code) : '-',
];

/**
 * 분류 결과로 전송 여부를 정한다.
 * null이면 이벤트를 만들지 않는다(호출부가 breadcrumb만 남김).
 */
export const decideApiReport = (
  info: ApiErrorInfo,
  options: { isMutation: boolean; captureMode: ApiCaptureMode }
): ApiReportDecision | null => {
  const { isMutation, captureMode } = options;

  if (captureMode === 'never') return null;

  // 정상 흐름이라 어떤 설정에서도 보내지 않는다
  if (
    info.kind === API_ERROR_KIND.SESSION_EXPIRED ||
    info.kind === API_ERROR_KIND.CANCELED
  ) {
    return null;
  }

  const fingerprint = buildFingerprint(info);

  if (captureMode === 'always') {
    return { level: 'error', fingerprint };
  }

  switch (info.kind) {
    // 서버 장애·타임아웃·예상 못한 throw는 전량 수집
    case API_ERROR_KIND.SERVER:
    case API_ERROR_KIND.TIMEOUT:
    case API_ERROR_KIND.UNKNOWN:
      return { level: 'error', fingerprint };

    case API_ERROR_KIND.NETWORK: {
      // 변경 요청 실패는 사용자 액션이 유실된 것이라 전량 수집
      if (isMutation) return { level: 'warning', fingerprint };

      return shouldSample(NETWORK_QUERY_SAMPLE_RATE)
        ? { level: 'warning', fingerprint }
        : null;
    }

    case API_ERROR_KIND.CLIENT: {
      if (
        info.code !== undefined &&
        CAPTURED_CLIENT_ERROR_CODES.has(info.code)
      ) {
        return { level: 'error', fingerprint };
      }

      // 401/403은 세션 만료 처리 경로 밖에서만 도달 — 드물어야 정상이라 소량만 확인
      if (info.status === 401 || info.status === 403) {
        return shouldSample(AUTH_STATUS_SAMPLE_RATE)
          ? { level: 'warning', fingerprint }
          : null;
      }

      // 그 외 4xx(404·409 중복요청·429 크레딧 초과 등)는 정상 비즈니스 흐름
      return null;
    }

    default:
      return null;
  }
};
