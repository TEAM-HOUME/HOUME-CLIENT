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

export interface FurnitureCategory {
  categoryId: number;
  nameKr: string;
  nameEng: string;
  furnitures: FurnitureOptionItem[];
}

export interface ActivityOptionsResponse {
  activities: ActivityOptionItem[];
  categories: FurnitureCategory;
}
