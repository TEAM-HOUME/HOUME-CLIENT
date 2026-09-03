/** createdAt(ISO 8601) → SearchItem recent 캡션용 "n일 전" 값 (캘린더 일 기준) */
export const getSearchDayCount = (
  createdAt: string,
  now = new Date()
): number => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(createdAt);
  if (!match) return 0;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // 2월 30일처럼 달력에 없는 날짜는 Date overflow로 다른 날이 되므로 거부
  const created = new Date(year, month - 1, day);
  if (
    created.getFullYear() !== year ||
    created.getMonth() !== month - 1 ||
    created.getDate() !== day
  ) {
    return 0;
  }

  // UTC 자정 기준으로 빼서 DST(23h/25h) 날에도 달력 일수가 어긋나지 않게 함
  const createdUtc = Date.UTC(year, month - 1, day);
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dayCount = Math.floor((nowUtc - createdUtc) / (24 * 60 * 60 * 1000));

  return Math.max(0, dayCount);
};
