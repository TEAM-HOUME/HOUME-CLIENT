import { COMPARE_SOURCE, type CompareSource } from '@pages/home/types/compare';

/**
 * 유사 상품 카드에 표시할 판매처명.
 * job 결과에는 판매처명(siteName)이 없고 source만 온다(2026-09-17 dev 실측). 프리셋 결과는 siteName이 있어 그대로 쓴다.
 */
export const COMPARE_SOURCE_LABEL: Record<CompareSource, string> = {
  [COMPARE_SOURCE.EBAY]: 'eBay',
  [COMPARE_SOURCE.COUPANG]: '쿠팡',
  [COMPARE_SOURCE.CATALOG]: '하우미',
};

const isCompareSource = (value: string): value is CompareSource =>
  Object.values<string>(COMPARE_SOURCE).includes(value);

/** 생성 타입의 source는 string이라 목록에 없는 값이 올 수 있다. 그때는 값을 그대로 보여준다 */
export const getCompareSourceLabel = (
  source: string | undefined
): string | undefined => {
  if (source === undefined) return undefined;
  return isCompareSource(source) ? COMPARE_SOURCE_LABEL[source] : source;
};
