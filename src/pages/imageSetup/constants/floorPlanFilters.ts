import type { FilterCategory } from '../types/floorPlan';

/**
 * 도면 필터 카테고리 정의
 * 각 option.id는 swagger의 enum 값과 1:1 매핑되어 그대로 쿼리 파라미터로 전송됨
 *  - residenceType: OFFICETEL, VILLA, APARTMENT, ETC
 *  - layoutType:    OPEN_ONE_ROOM, SEPARATED_ONE_ROOM, DUPLEX, TWO_ROOM, THREE_ROOM_OVER
 *  - equilibrium:   UNDER_5, BETWEEN_6_10, BETWEEN_11_15, OVER_16
 */
export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: 'residenceType',
    label: '주거 형태',
    options: [
      { id: 'ALL', label: '전체' },
      { id: 'OFFICETEL', label: '오피스텔' },
      { id: 'VILLA', label: '빌라/다세대' },
      { id: 'APARTMENT', label: '아파트' },
      { id: 'ETC', label: '그 외' },
    ],
  },
  {
    id: 'layoutType',
    label: '구조',
    options: [
      { id: 'ALL', label: '전체' },
      { id: 'OPEN_ONE_ROOM', label: '오픈형 원룸' },
      { id: 'SEPARATED_ONE_ROOM', label: '분리형 원룸' },
      { id: 'DUPLEX', label: '복층형' },
      { id: 'TWO_ROOM', label: '투룸' },
      { id: 'THREE_ROOM_OVER', label: '쓰리룸 이상' },
    ],
  },
  {
    id: 'equilibrium',
    label: '평형',
    options: [
      { id: 'ALL', label: '전체' },
      { id: 'UNDER_5', label: '5평 이하' },
      { id: 'BETWEEN_6_10', label: '6-10평' },
      { id: 'BETWEEN_11_15', label: '11-15평' },
      { id: 'OVER_16', label: '16평 이상' },
    ],
  },
];
