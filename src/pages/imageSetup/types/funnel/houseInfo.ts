// HouseInfo 도메인 관련 모든 타입 통합 관리
import type { HousingOptionsResponse } from '../apis/houseInfo';

// API 기반 Union 타입 추출
// ex: "OFFICETEL" | "VILLA" | "APARTMENT" | "ETC"
export type HouseType = HousingOptionsResponse['houseTypes'][number]['code'];
export type RoomType = HousingOptionsResponse['roomTypes'][number]['code'];
export type AreaType = HousingOptionsResponse['areaTypes'][number]['code'];

// 폼 데이터 타입(사용자 입력값)
export interface HouseInfoFormData {
  houseType?: HouseType;
  roomType?: RoomType;
  areaType?: AreaType;
}

// 완성된 HouseInfo 데이터 타입(집구조 선택 POST 요청 응답)
export interface CompletedHouseInfo {
  houseType: HouseType;
  roomType: RoomType;
  areaType: AreaType;
  houseId: number;
}

// funnel 스텝 컨텍스트 타입
export interface HouseInfoContext {
  houseType?: HouseType;
  roomType?: RoomType;
  areaType?: AreaType;
  houseId?: number;
}

// 에러 타입
export interface HouseInfoErrors {
  houseType?: string;
  roomType?: string;
  areaType?: string;
}
