import type { BaseResponse } from '@shared/types/apis';

// 마이페이지 사용자 정보 조회 API
export interface MyPageUserData {
  userId: number;
  name: string;
  CreditCount: number; // 서버 응답과 동일하게 CreditCount 사용
}

export type MyPageUserResponse = BaseResponse<MyPageUserData>;
