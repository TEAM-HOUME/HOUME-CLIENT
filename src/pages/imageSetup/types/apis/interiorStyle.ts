export interface MoodBoardImageItem {
  id: number;
  imageUrl: string;
  fileExtension: string;
}

export interface MoodBoardImageResponse {
  code: number;
  msg: string;
  data: {
    moodBoardResponseList: MoodBoardImageItem[];
  };
}

export const MOOD_BOARD_CONSTANTS = {
  DEFAULT_LIMIT: 18, // 기본 이미지 로드 개수
  MAX_SELECTIONS: 5, // 최대 선택 가능한 이미지 개수
  DEFAULT_CURSOR: 0, // 기본 커서 위치
} as const;
