// 찜한 가구 목록 조회
export interface JjymsResponse {
  items: FurnitureItem[];
}

export interface FurnitureItem {
  id: number;
  furnitureProductImageUrl: string;
  furnitureProductSiteUrl: string;
  furnitureProductName: string;
  furnitureProductId: number;
}
