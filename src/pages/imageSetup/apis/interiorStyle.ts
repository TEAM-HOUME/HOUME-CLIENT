import { useQuery } from '@tanstack/react-query';

import {
  MOOD_BOARD_CONSTANTS,
  type MoodBoardImageResponse,
} from '@/pages/imageSetup/types/apis/interiorStyle';
import { HTTPMethod, request } from '@/shared/apis/request';
import { API_ENDPOINT } from '@/shared/constants/apiEndpoints';

// API Functions
/**
 * 무드보드 이미지를 가져옵니다.
 *
 * @returns Promise<MoodBoardImageResponse> - 무드보드 이미지 저장 결과 메시지
 *
 * @example
 * ```typescript
 * const result = await getMoodBoardImage();
 * console.log(result.data); // 무드보드 이미지 데이터
 * ```
 */
export const getMoodBoardImage = async (
  limit = MOOD_BOARD_CONSTANTS.DEFAULT_LIMIT
): Promise<MoodBoardImageResponse> => {
  return request({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.IMAGE_SETUP.INTERIOR_STYLE,
    query: { limit },
  });
};

export const useMoodBoardQuery = (
  limit = MOOD_BOARD_CONSTANTS.DEFAULT_LIMIT
) => {
  return useQuery({
    queryKey: ['moodBoardImages', limit],
    queryFn: () => getMoodBoardImage(limit),
  });
};
