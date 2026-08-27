interface DeepLinkLocation {
  pathname: string;
  search: string;
  hash: string;
}

/** `https:/` `https://` `https%3A/` 등 맨 앞의 프로토콜 표기를 모두 받는다 */
const PROTOCOL_PREFIX = /^(https?)(?::|%3a)\/*/i;

const decodeWholeUrlSegment = (path: string): string => {
  if (path.includes('/')) return path;

  try {
    const decoded = decodeURIComponent(path);
    return decoded.includes('/') ? decoded : path;
  } catch {
    // 깨진 퍼센트 시퀀스(`%ZZ`) — 원문을 그대로 넘기고 URL 검증에서 판정한다
    return path;
  }
};

/** 프로토콜 표기를 `https://` 형태로 되살리고, 생략된 경우 https를 보정 */
const restoreProtocol = (path: string): string =>
  PROTOCOL_PREFIX.test(path)
    ? path.replace(
        PROTOCOL_PREFIX,
        (_match, scheme: string) => `${scheme.toLowerCase()}://`
      )
    : `https://${path}`;

/**
 * 딥링크 경로에서 원본 상품 URL을 복원한다.
 *
 * @returns 복원된 URL. 딥링크로 볼 수 없는 경로면 `null` (호출부에서 NotFound로 분기)
 */
export const restoreDeepLinkUrl = ({
  pathname,
  search,
  hash,
}: DeepLinkLocation): string | null => {
  const path = pathname.replace(/^\/+/, '');
  if (!path) return null;

  const candidate = `${restoreProtocol(decodeWholeUrlSegment(path))}${search}${hash}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  // 호스트에 점이 없으면 외부 상품 URL이 아니라 앱 경로 오타로 본다 (`/mypagee` 등)
  if (!url.hostname.includes('.')) return null;

  // url.toString()이 아니라 원문을 돌려준다. toString은 인코딩·기본 포트·빈 경로를 다시 손대서
  // 서버가 스크래핑할 URL의 바이트가 사용자가 넣은 것과 달라진다.
  return candidate;
};
