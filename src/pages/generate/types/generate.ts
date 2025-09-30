export interface GenerateTypes {
  sqft: string;
  style: string[];
  user: string;
}

// 결과 페이지 좋아요/별로예요 상태
export type ResultPageLikeState = 'like' | 'dislike' | null;

// 스택 UI
export interface CarouselItem {
  carouselId: number;
  url: string;
}

export interface ImageStackResponse {
  carouselResponseDTOS: CarouselItem[];
}

// 이미지 생성 API 요청 데이터 타입
export interface GenerateImageRequest extends Record<string, unknown> {
  houseId: number;
  equilibrium: string;
  floorPlan: {
    floorPlanId: number;
    isMirror: boolean;
  };
  moodBoardIds: number[];
  activity: string;
  selectiveIds: number[];
}

// 이미지 생성 API 응답 데이터 타입
export interface GenerateImageData {
  imageId: number;
  imageUrl: string;
  isMirror: boolean;
  equilibrium: string;
  houseForm: string;
  tagName: string;
  name: string;
}

// 이미지 생성 API 응답 데이터 타입 - 여러 이미지 응답 (A안)
export interface GenerateImageAResponse {
  code: number;
  msg: string;
  data: {
    imageInfoResponses: GenerateImageData[];
  };
}

// 이미지 생성 API 응답 데이터 타입 - 단일 이미지 (B안)
export interface GenerateImageBResponse {
  code: number;
  msg: string;
  data: GenerateImageData;
}
