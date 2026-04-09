import type { BaseResponse } from '@shared/types/apis';

// 마이페이지 이미지 생성 이력 조회 API
export interface MyPageImageHistory {
  generatedImageUrl: string; // 서버 응답 필드명 그대로 사용
  tasteTag: string; // 서버 응답 필드명 그대로 사용
  equilibrium: string;
  houseForm: string;
  imageId: number;
  houseId: number;
}

export interface MyPageImagesData {
  histories: MyPageImageHistory[];
}

export type MyPageImagesResponse = BaseResponse<MyPageImagesData>;

// 마이페이지 이미지 상세 조회 API
export interface MyPageImageDetail {
  equilibrium: string;
  houseForm: string;
  tasteTag: string;
  name: string;
  generatedImageUrl: string;
  isLike: boolean;
  factorId?: number;
  factorText?: string;
  imageId: number;
}

export interface MyPageImageDetailData {
  histories: MyPageImageDetail[];
}

export type MyPageImageDetailResponse = BaseResponse<MyPageImageDetailData>;

export interface GeneratedImageListResponseData {
  groups: GeneratedImageListData[];
}

export type GeneratedImageListResponse =
  BaseResponse<GeneratedImageListResponseData>;

export interface GeneratedImageListData {
  date: string;
  items: GeneratedImageListItem[];
}

type ViewType = 'LIST' | 'CURATION';
export interface GeneratedImageListItem {
  imageId: number;
  viewType: ViewType;
  generatedImageUrl: string;
  generatedAt: string;
  bannerTitle: string;
  productSummaryText: string;
  usedProducts: UsedProduct[];
}

export interface UsedProduct {
  rawProductId: number;
  productImageUrl: string;
  productName: string;
  listPrice: number;
  discountRate: number;
  discountPrice: number;
  productSiteUrl: string;
  isJjym: boolean;
  colors: string[];
}
