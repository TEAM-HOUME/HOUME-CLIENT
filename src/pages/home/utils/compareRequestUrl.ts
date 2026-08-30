/**
 * 상품 URL을 서버로 보낼 형태로 맞춘다.
 *
 * @returns 인코딩된 URL. 파싱되지 않는 값이면 원문 그대로 (서버가 400으로 판정)
 */
export const toCompareRequestUrl = (rawUrl: string): string => {
  try {
    return new URL(rawUrl).toString();
  } catch {
    return rawUrl;
  }
};
