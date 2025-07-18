import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMoodBoardImage } from '../apis/MoodBoardImage';
import {
  MOOD_BOARD_CONSTANTS,
  type MoodBoardImageResponse,
} from '../types/apis/moodBoard';

/**
 * 무드보드 이미지를 가져오는 커스텀 훅입니다.
 *
 * @param {number} [cursor=0] - 페이징을 위한 커서 값 (현재 미사용)
 * @param {number} [limit=18] - 한 번에 가져올 이미지 개수
 * @returns {import('@tanstack/react-query').UseQueryResult<MoodBoardImageResponse, Error>} React Query의 쿼리 결과 객체
 *
 * @example
 * const { data, isLoading, error } = useMoodBoardImage(0, 10);
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
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
};

export const usePrefetchMoodBoard = () => {
  const queryClient = useQueryClient();

  const prefetchMoodBoard = (limit = MOOD_BOARD_CONSTANTS.DEFAULT_LIMIT) => {
    queryClient.prefetchQuery({
      queryKey: ['moodBoardImages', limit],
      queryFn: () => getMoodBoardImage(limit),
      staleTime: 1 * 60 * 1000,
    });
  };
  return { prefetchMoodBoard };
};
