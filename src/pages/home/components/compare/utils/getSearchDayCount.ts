/** 소수점 이하가 4자리 이상이면 3자리로 자른다 — `new Date()`가 마이크로초 표기를 거부하는 환경 대비 */
const trimFractionSeconds = (value: string): string =>
  value.replace(/(\.\d{3})\d+/, '$1');

/** `Z`나 `+09:00` 같은 시간대 표기가 끝에 있는지 */
const hasTimeZone = (value: string): boolean =>
  /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);

/**
 * createdAt → SearchItem recent 캡션용 "n일 전" 값 (사용자 로컬 달력 일 기준)
 *
 * 서버는 `2026-09-17T06:23:20.014789`처럼 시간대 표기 없는 UTC로 보낸다(2026-09-17 dev 실측).
 * 그대로 파싱하면 로컬 시각으로 읽혀 한국에서는 9시간이 어긋나고, 자정~오전 9시 사이의 비교가 "1일 전"이 된다.
 * 시간대가 없으면 UTC로 간주해 파싱한 뒤 로컬 달력 날짜끼리 뺀다.
 */
export const getSearchDayCount = (
  createdAt: string,
  now = new Date()
): number => {
  const normalized = trimFractionSeconds(createdAt);
  const created = new Date(
    hasTimeZone(normalized) ? normalized : `${normalized}Z`
  );
  if (Number.isNaN(created.getTime())) return 0;

  // 달력 날짜만 UTC 자정으로 옮겨 빼면 DST(23h/25h) 날에도 일수가 어긋나지 않는다
  const createdDay = Date.UTC(
    created.getFullYear(),
    created.getMonth(),
    created.getDate()
  );
  const nowDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dayCount = Math.floor((nowDay - createdDay) / (24 * 60 * 60 * 1000));

  return Math.max(0, dayCount);
};
