// HouseInfo 스텝 관련 도메인 타입
import type { HousingOptionsResponse } from '../apis/houseInfo';

// 주거 옵션 Union 타입 추출
// ex: "OFFICETEL" | "VILLA" | "APARTMENT" | "ETC"
export type HouseType = HousingOptionsResponse['houseTypes'][number]['code'];
export type RoomType = HousingOptionsResponse['roomTypes'][number]['code'];
export type AreaType = HousingOptionsResponse['areaTypes'][number]['code'];

// HouseInfo 스텝 폼 데이터 타입
export interface HouseInfoFormData {
  houseType?: HouseType;
  roomType?: RoomType;
  areaType?: AreaType;
}

// HouseInfo 스텝 에러 타입
// TODO(지성): string 타입 선언 적절한지 확인
export interface HouseInfoErrors {
  houseType?: string;
  roomType?: string;
  areaType?: string;
}
