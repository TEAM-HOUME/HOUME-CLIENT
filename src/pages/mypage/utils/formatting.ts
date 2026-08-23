export const formatDate = (date: string) => {
  return date.replace(
    /(\d{4})-(\d{2})-(\d{2})/,
    (_: string, y: string, m: string, d: string) => `${y.slice(2)}.${m}.${d}`
  );
};
