// @use-funnel/react-router의 funnel 식별자
// useFunnel({ id: FUNNEL_ID }) 에 사용되며, step 이동 시 URL search에 `${FUNNEL_ID}.step=...` 형태로 추가됨
export const FUNNEL_ID = 'image-generation-funnel';

// step 이동을 식별하는 URL search param 키
// useExitBlocker의 shouldBlockNavigation에서 정상 step 이동을 통과시키는 데 사용됨
export const FUNNEL_STEP_PARAM = `${FUNNEL_ID}.step=`;
