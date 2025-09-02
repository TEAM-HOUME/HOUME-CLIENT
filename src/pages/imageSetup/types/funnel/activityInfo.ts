import type { ActivityOptionsResponse } from '../apis/activityInfo';

// 유니온 타입 추출
export type ActivityTypes =
  ActivityOptionsResponse['activities'][number]['code'];
export type BedTypes = ActivityOptionsResponse['beds']['items'][number]['code'];
export type SelectiveFurnitureTypes =
  ActivityOptionsResponse['selectives']['items'][number]['code'];
