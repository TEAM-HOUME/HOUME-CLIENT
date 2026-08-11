// 정적 데이터(도면/활동/가구 카테고리/무드보드) 캐시 정책
// admin이 데이터를 추가/수정해도 사용자 새로고침 없이 1시간 내 자동 반영되도록
// staleTime을 1시간으로 설정. prefetch와 useQuery가 동일 정책을 공유한다.
export const STATIC_DATA_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 60,
  gcTime: 1000 * 60 * 60 * 24,
} as const;
