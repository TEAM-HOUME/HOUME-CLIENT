import type { ActivityOptionsResponse } from '../apis/activityInfo';

// 유니온 타입 추출
export type ActivityTypes =
  ActivityOptionsResponse['activities'][number]['code'];
export type BedIds = ActivityOptionsResponse['beds']['items'][number]['id'];
export type SelectiveFurnitureIds =
  ActivityOptionsResponse['selectives']['items'][number]['id'];
