// 집구조 요청 GET API
export interface HouseOptionItem {
  code: string;
  label: string;
}

export interface HouseOptionsResponse {
  houseTypes: HouseOptionItem[];
  roomTypes: HouseOptionItem[];
  areaTypes: HouseOptionItem[];
}

// 유니온 타입 추출
export type HouseTypeCode = HouseOptionsResponse['houseTypes'][number]['code'];
export type RoomTypeCode = HouseOptionsResponse['roomTypes'][number]['code'];
export type AreaTypeCode = HouseOptionsResponse['areaTypes'][number]['code'];

// 데이터 부분만 따로 추출한 타입
export type HouseOptionsData = HouseOptionsResponse;

// 집구조 선택 POST API
export interface SelectHouseInfoRequest extends Record<string, unknown> {
  houseType: string;
  roomType: string;
  areaType: string;
  isValid: boolean;
}
export interface SelectHouseInfoResponse {
  houseId: number;
}
