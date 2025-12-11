export const getCanHistoryGoBack = () => {
  if (typeof window === 'undefined') return false;
  const historyState = window.history.state;
  if (!historyState) return false;
  const idx = typeof historyState.idx === 'number' ? historyState.idx : 0;
  return idx > 0;
};
