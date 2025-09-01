const createOption = (key: string, label: string) => ({
  code: key,
  label: label,
});
const createOptionWithId = (id: number, code: string, label: string) => ({
  id: id,
  code: code,
  label: label,
});

// Step 4
export const MAIN_ACTIVITY_OPTIONS = {
  PRIMARY_USAGE: {
    RELAXING: createOption('RELAXING', '휴식형'),
    REMOTE_WORK: createOption('REMOTE_WORK', '재택근무형'),
    HOME_THEATER: createOption('HOME_THEATER', '영화감상형'),
    HOME_CAFE: createOption('HOME_CAFE', '홈카페형'),
  },
  BED_TYPE: {
    SINGLE: createOptionWithId(1, 'SINGLE', '싱글'),
    SUPER_SINGLE: createOptionWithId(2, 'SUPER_SINGLE', '슈퍼싱글'),
    DOUBLE: createOptionWithId(3, 'DOUBLE', '더블'),
    QUEEN_OVER: createOptionWithId(4, 'QUEEN_OVER', '퀸 이상'),
  },
  OTHER_FURNITURES: {
    DESK: createOptionWithId(5, 'DESK', '책상'),
    CLOSET: createOptionWithId(6, 'CLOSET', '옷장'),
    TABLE_CHAIRS: createOptionWithId(7, 'TABLE_CHAIRS', '식탁, 의자'),
    SOFA: createOptionWithId(8, 'SOFA', '소파'),
    DRAWER: createOptionWithId(9, 'DRAWER', '수납장'),
    MOVABLE_TV: createOptionWithId(10, 'MOVABLE_TV', '이동식 TV'),
  },
} as const;

// MAIN_ACTIVITY_OPTIONS 개별 타입 추출
export type PrimaryUsage =
  (typeof MAIN_ACTIVITY_OPTIONS.PRIMARY_USAGE)[keyof typeof MAIN_ACTIVITY_OPTIONS.PRIMARY_USAGE]['code'];
export type BedType =
  (typeof MAIN_ACTIVITY_OPTIONS.BED_TYPE)[keyof typeof MAIN_ACTIVITY_OPTIONS.BED_TYPE]['code'];
export type OtherFurnitures =
  (typeof MAIN_ACTIVITY_OPTIONS.OTHER_FURNITURES)[keyof typeof MAIN_ACTIVITY_OPTIONS.OTHER_FURNITURES]['code'];
