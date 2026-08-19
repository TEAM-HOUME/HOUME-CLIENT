import type { Gender } from '@shared/types/formOptions';

// 사용자 프로필 수정
export interface EditProfileRequest {
  nickname: string;
  gender: Gender;
  birthday: string;
}
