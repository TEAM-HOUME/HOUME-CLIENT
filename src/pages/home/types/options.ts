import Rest from '@assets/images/landingRest.png';
import RemoteWork from '@assets/images/landingRemoteWork.png';
import Movie from '@assets/images/landingMovie.png';
import Cafe from '@assets/images/landingHomeCafe.png';

export const INTERIOR_OPTIONS = [
  '휴식형',
  '재택근무형',
  '홈카페형',
  '영화감상형',
] as const;

export type InteriorOption = (typeof INTERIOR_OPTIONS)[number];

// 인테리어 옵션별 이미지 매핑
export const INTERIOR_IMAGES: Record<InteriorOption, string> = {
  휴식형: Rest,
  재택근무형: RemoteWork,
  홈카페형: Cafe,
  영화감상형: Movie,
} as const;
