/** createdAt(ISO 8601) → SearchItem recent 캡션용 "n일 전" 값 (캘린더 일 기준) */
export const getSearchDayCountFromCreatedAt = (
  createdAt: string,
  now = new Date()
): number => {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 0;

  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = startOfDay(now).getTime() - startOfDay(created).getTime();
  const dayCount = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  return Math.max(0, dayCount);
};
