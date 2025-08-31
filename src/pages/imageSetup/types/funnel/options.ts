const createOption = (key: string, label: string) => ({
  code: key,
  label: label,
});
const createOptionWithId = (id: number, code: string, label: string) => ({
  id: id,
  code: code,
  label: label,
});

// Step 1
export const HOUSE_INFO_OPTIONS = {
  HOUSING_TYPES: {
    OFFICETEL: createOption('OFFICETEL', '오피스텔'),
    VILLA: createOption('VILLA', '빌라/다세대'),
    APARTMENT: createOption('APARTMENT', '아파트'),
    ETC: createOption('ETC', '그 외'),
  },
  ROOM_TYPES: {
    OPEN_ONE_ROOM: createOption('OPEN_ONE_ROOM', '오픈형 원룸'),
    SEPARATED_ONE_ROOM: createOption('SEPARATED_ONE_ROOM', '분리형 원룸'),
    DUPLEX: createOption('DUPLEX', '복층형'),
    TWO_ROOM: createOption('TWO_ROOM', '투룸'),
    THREE_ROOM_OVER: createOption('THREE_ROOM_OVER', '쓰리룸+'),
  },
  AREA_TYPES: {
    UNDER_5: createOption('UNDER_5', '5평 이하'),
    BETWEEN_6_10: createOption('BETWEEN_6_10', '6-10평'),
    BETWEEN_11_15: createOption('BETWEEN_11_15', '11-15평'),
    OVER_16: createOption('OVER_16', '16평 이상'),
  },
} as const;

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

// HOUSE_INFO_OPTIONS 개별 타입 추출
/*
ex)
HouseType = "OFFICETEL" | "VILLA" | "APARTMENT" | "ETC" (4개 리터럴 타입)
houseType?: HouseType -> houseType은 HouseType | undefined
*/
export type HouseType =
  (typeof HOUSE_INFO_OPTIONS.HOUSING_TYPES)[keyof typeof HOUSE_INFO_OPTIONS.HOUSING_TYPES]['code'];
export type RoomType =
  (typeof HOUSE_INFO_OPTIONS.ROOM_TYPES)[keyof typeof HOUSE_INFO_OPTIONS.ROOM_TYPES]['code'];
export type AreaType =
  (typeof HOUSE_INFO_OPTIONS.AREA_TYPES)[keyof typeof HOUSE_INFO_OPTIONS.AREA_TYPES]['code'];

// MAIN_ACTIVITY_OPTIONS 개별 타입 추출
export type PrimaryUsage =
  (typeof MAIN_ACTIVITY_OPTIONS.PRIMARY_USAGE)[keyof typeof MAIN_ACTIVITY_OPTIONS.PRIMARY_USAGE]['code'];
export type BedType =
  (typeof MAIN_ACTIVITY_OPTIONS.BED_TYPE)[keyof typeof MAIN_ACTIVITY_OPTIONS.BED_TYPE]['code'];
export type OtherFurnitures =
  (typeof MAIN_ACTIVITY_OPTIONS.OTHER_FURNITURES)[keyof typeof MAIN_ACTIVITY_OPTIONS.OTHER_FURNITURES]['code'];
