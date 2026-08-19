import type { AxiosResponse } from 'axios';

/**
 * 응답 헤더에서 access-token을 꺼낸다.
 *
 * axios의 `response.headers`는 인덱스 접근 결과가 `any`라, 값을 그대로 쓰면
 * 토큰이 any인 채로 localStorage·zustand·Authorization 헤더까지 퍼진다.
 * 여기서 한 번만 string으로 좁혀 내보낸다.
 */
export const readAccessTokenHeader = (
  response: Pick<AxiosResponse, 'headers'>
): string | undefined => {
  const raw: unknown = response.headers['access-token'];

  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
};
