// Activity Options API 타입 정의
export interface ActivityOptionItem {
  code: string;
  label: string;
}

export interface FurnitureOptionItem {
  id: number;
  type: string;
  name: string;
}

export interface FurnitureGroup {
  isRequired: boolean;
  items: FurnitureOptionItem[];
}

export interface ActivityOptionsResponse {
  activities: ActivityOptionItem[];
  beds: FurnitureGroup;
  selectives: FurnitureGroup;
}

// 유니온 타입 추출
export type ActivityCode =
  ActivityOptionsResponse['activities'][number]['code'];
export type BedId = ActivityOptionsResponse['beds']['items'][number]['id'];
export type SelectiveFurnitureId =
  ActivityOptionsResponse['selectives']['items'][number]['id'];

// 데이터 부분만 따로 추출한 타입
export type ActivityOptionsData = ActivityOptionsResponse;
