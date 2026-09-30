const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;
const WHITESPACE = /\s/;
// 알파벳 TLD 또는 punycode로 변환된 국제화 TLD(.한국 → xn--3e0b707e)
const VALID_TLD = /^(?:[a-z]{2,}|xn--[a-z0-9-]+)$/;

/**
 * 상품 URL 1차 검증. 서버로 보내기 전에 명백히 URL이 아닌 값만 거른다.
 * 지원 쇼핑몰 여부·프로토콜 종류는 판단하지 않는다 (서버 몫).
 *
 * 스킴이 없는 입력은 검증할 때만 임시로 `https://`를 붙여 파싱한다. 서버로는 원문을 보낸다.
 * 스킴 유무는 `://`로 판단한다. `coupang.com:8080/x`를 `coupang.com:` 스킴으로 오인하지 않기 위해서다.
 */
export const isValidProductUrl = (rawUrl: string): boolean => {
  const trimmed = rawUrl.trim();
  if (!trimmed || WHITESPACE.test(trimmed)) return false;

  let url: URL;
  try {
    url = new URL(HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return false;
  }

  // 스킴 없는 `mailto:a@b.com`이 https://mailto:a@b.com으로 파싱돼 b.com으로 통과하는 것을 막는다
  if (url.username || url.password) return false;

  const labels = url.hostname.split('.');
  if (labels.length < 2 || labels.some((label) => !label)) return false;

  return VALID_TLD.test(labels.at(-1) ?? '');
};
