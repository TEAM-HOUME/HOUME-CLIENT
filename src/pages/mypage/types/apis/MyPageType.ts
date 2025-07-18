import type { BaseResponse } from '@shared/types/apis';

// 마이페이지 사용자 정보 조회 API
export interface MyPageUserData {
  name: string;
  CreditCount: number; // 서버 응답과 동일하게 CreditCount 사용
}

export type MyPageUserResponse = BaseResponse<MyPageUserData>;

// 마이페이지 이미지 생성 이력 조회 API
export interface MyPageImageHistory {
  generatedImageUrl: string; // 서버 응답 필드명 그대로 사용
  tasteTag: string; // 서버 응답 필드명 그대로 사용
  equilibrium: string;
  houseForm: string;
  imageId: number;
}

export interface MyPageImagesData {
  histories: MyPageImageHistory[];
}

export type MyPageImagesResponse = BaseResponse<MyPageImagesData>;

// 마이페이지 이미지 상세 조회 API
export interface MyPageImageDetailData {
  equilibrium: string;
  houseForm: string;
  tasteTag: string; // 서버 응답 필드명 그대로 사용
  name: string;
  generatedImageUrl: string; // 서버 응답 필드명 그대로 사용
  isLike: boolean; // 이미지 선호도 여부
}

export type MyPageImageDetailResponse = BaseResponse<MyPageImageDetailData>;
