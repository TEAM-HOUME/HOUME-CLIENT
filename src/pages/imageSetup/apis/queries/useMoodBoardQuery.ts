import { useQuery } from '@tanstack/react-query';

import {
  MOOD_BOARD_CONSTANTS,
  type MoodBoardImageResponse,
} from '@pages/imageSetup/types/apis/interiorStyle';

import { HTTPMethod, request } from '@apis/config/request';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { STATIC_DATA_QUERY_OPTIONS } from '@constants/cache';
import { queryKeys } from '@constants/queryKey';

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
    queryKey: queryKeys.imageSetup.moodBoard(limit),
    queryFn: () => getMoodBoardImage(limit),
    ...STATIC_DATA_QUERY_OPTIONS,
  });
};
