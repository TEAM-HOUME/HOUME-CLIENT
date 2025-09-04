import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MOOD_BOARD_CONSTANTS,
  type MoodBoardImageResponse,
} from '@/pages/imageSetup/types/apis/interiorStyle';
import { API_ENDPOINT } from '@/shared/constants/apiEndpoints';
import { HTTPMethod, request } from '@/shared/apis/request';

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
const getMoodBoardImage = async (
  limit = MOOD_BOARD_CONSTANTS.DEFAULT_LIMIT
): Promise<MoodBoardImageResponse> => {
  return request<MoodBoardImageResponse>({
    method: HTTPMethod.GET,
    url: API_ENDPOINT.IMAGE_SETUP.INTERIOR_STYLE,
    query: { limit },
  });
};

// Query Hooks
/**
 * 무드보드 이미지를 가져오는 커스텀 훅입니다.
 *
 * @param {number} [limit=18] - 한 번에 가져올 이미지 개수
 * @returns {import('@tanstack/react-query').UseQueryResult<MoodBoardImageResponse, Error>} React Query의 쿼리 결과 객체
 *
 * @example
 * const { data, isLoading, error } = useMoodBoardImage(10);
 */
export const useMoodBoardImage = (
  limit = MOOD_BOARD_CONSTANTS.DEFAULT_LIMIT
) => {
  return useQuery<MoodBoardImageResponse, Error>({
    queryKey: ['moodBoardImages', limit], // cursor는 향후 페이지네이션 구현 시 사용 예정
    queryFn: () => getMoodBoardImage(limit),
  });
};

export const useMoodBoardQuery = (
  limit = MOOD_BOARD_CONSTANTS.DEFAULT_LIMIT
) => {
  return useQuery({
    queryKey: ['moodBoardImages', limit],
    queryFn: () => getMoodBoardImage(limit),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchMoodBoard = () => {
  const queryClient = useQueryClient();

  const prefetchMoodBoard = (limit = MOOD_BOARD_CONSTANTS.DEFAULT_LIMIT) => {
    queryClient.prefetchQuery({
      queryKey: ['moodBoardImages', limit],
      queryFn: () => getMoodBoardImage(limit),
      staleTime: 3 * 60 * 1000,
    });
  };
  return { prefetchMoodBoard };
};
