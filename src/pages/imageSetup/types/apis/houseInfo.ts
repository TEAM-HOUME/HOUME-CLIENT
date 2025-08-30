// 집구조 선택 API 요청
export interface SelectHouseInfoRequest extends Record<string, unknown> {
  houseType: string;
  roomType: string;
  areaType: string;
  isValid: boolean;
}

// 집구조 선택 API 응답
export interface SelectHouseInfoResponse {
  code: number;
  msg: string;
  data?: {
    houseId: number;
  };
}
