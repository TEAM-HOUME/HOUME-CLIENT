export const HOUSE_INFO_VALIDATION = {
  restrictedValues: {
    houseType: ['APARTMENT', 'ETC'],
    roomType: ['TWO_ROOM', 'THREE_ROOM_OVER', 'SEPARATED_ONE_ROOM'],
  },
  messages: {
    houseType:
      '현재 아파트, 그 외 유형은 지원하지 않아요.\n점차 확대될 예정이에요.',
    roomType:
      '현재 분리형 원룸, 투룸, 쓰리룸 이상 유형은 지원하지 않아요.\n점차 확대될 예정이에요.',
  },
};

export const MAIN_ACTIVITY_VALIDATION = {
  combinationRules: {
    REMOTE_WORK: {
      requiredFurnitures: ['DESK'],
    },
    READING: {
      requiredFurnitures: ['BOOK_SHELF'],
    },
    FLOOR_LIVING: {
      requiredFurnitures: ['SITTING_TABLE'],
    },
    HOME_CAFE: {
      requiredFurnitures: ['TABLE'],
    },
  },
} as const;
