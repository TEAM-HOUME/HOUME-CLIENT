import type { HouseType, RoomType } from './houseInfo';

export type OtherFurnitures =
  | 'DESK'
  | 'CLOSET'
  | 'TABLE_CHAIRS'
  | 'SOFA'
  | 'DRAWER'
  | 'MOVABLE_TV';

export const HOUSE_INFO_VALIDATION = {
  restrictedValues: {
    houseType: ['APARTMENT', 'ETC'] as HouseType[],
    roomType: [
      'TWO_ROOM',
      'THREE_ROOM_OVER',
      'SEPARATED_ONE_ROOM',
    ] as RoomType[],
  },
  messages: {
    houseType:
      '현재 아파트, 그 외 유형은 지원하지 않아요.\n점차 확대될 예정이에요.',
    roomType:
      '현재 분리형 원룸, 투룸, 쓰리룸 이상 유형은 지원하지 않아요.\n점차 확대될 예정이에요.',
  },
} as const;

export const MAIN_ACTIVITY_VALIDATION = {
  combinationRules: {
    RELAXING: {
      requiredFurnitures: ['SOFA'] as OtherFurnitures[],
    },
    REMOTE_WORK: {
      requiredFurnitures: ['DESK'] as OtherFurnitures[],
    },
    HOME_CAFE: {
      requiredFurnitures: ['TABLE_CHAIRS'] as OtherFurnitures[],
    },
    HOME_THEATER: {
      requiredFurnitures: ['MOVABLE_TV'] as OtherFurnitures[],
    },
  },
};

export const allRequiredFurnitures = Object.values(
  MAIN_ACTIVITY_VALIDATION.combinationRules
).flatMap((rule) => rule.requiredFurnitures);
