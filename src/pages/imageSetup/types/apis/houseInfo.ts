// 주거 옵션 조회 (GET)
export interface HousingOptionItem {
  code: string;
  label: string;
}

export interface HousingOptionsResponse {
  houseTypes: HousingOptionItem[];
  roomTypes: HousingOptionItem[];
  areaTypes: HousingOptionItem[];
}

// 유니온 타입 추출
export type HouseTypeCode =
  HousingOptionsResponse['houseTypes'][number]['code'];
// "OFFICETEL" | "VILLA" | "APARTMENT" | "ETC" 유니온 타입
export type RoomTypeCode = HousingOptionsResponse['roomTypes'][number]['code'];
export type AreaTypeCode = HousingOptionsResponse['areaTypes'][number]['code'];

// 주거 선택 전송 (POST)
export interface HousingSelectionRequest extends Record<string, unknown> {
  houseType: string;
  roomType: string;
  areaType: string;
  isValid: boolean;
}

export interface HousingSelectionResponse {
  houseId: number;
}
