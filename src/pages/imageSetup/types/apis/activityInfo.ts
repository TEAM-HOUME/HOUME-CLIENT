// Activity Options API 타입 정의
export interface ActivityOptionItem {
  code: string;
  label: string;
}

export interface FurnitureOptionItem {
  id: number;
  code: string;
  label: string;
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
