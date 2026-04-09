// 찜한 가구 목록 조회
export interface JjymsResponse {
  items: FurnitureItem[];
}

export interface FurnitureItem {
  rawProductId: number;
  productImageUrl: string;
  productSiteUrl: string;
  productName: string;
  brandName: string;
  colors: string[];
  listPrice: number;
  discountRate: number;
  discountPrice: number;
  jjymCount: number;
}
