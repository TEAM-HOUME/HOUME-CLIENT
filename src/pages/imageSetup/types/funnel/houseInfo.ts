// HouseInfo 도메인 관련 모든 타입 통합 관리
// 폼 데이터 타입(사용자 입력값)
export type HouseInfoFormData = {
  houseType?: string;
  roomType?: string;
  areaType?: string;
};

// funnel 스텝 컨텍스트 타입
// ImageSetup.tsx에서 각 최상위 스텝 컴포넌트에 props의 타입으로 사용
export type HouseInfoContext = {
  houseType?: string;
  roomType?: string;
  areaType?: string;
  houseId?: number;
};

// 완성된 HouseInfo 데이터 타입(집구조 선택 POST 요청 응답)
export type CompletedHouseInfo = Required<HouseInfoContext>;

// 에러 타입
export interface HouseInfoErrors {
  houseType?: string;
  roomType?: string;
  areaType?: string;
}
