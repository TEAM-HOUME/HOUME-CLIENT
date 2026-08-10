import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type {
  EditProfileRequest,
  MyPageUserData,
} from '@pages/mypage/types/apis/userData';

import { TOASTER_ID, TOAST_TYPE } from '@shared/types/toast';

import type { MyPageProfileResponse } from '@apis/__generated__/data-contracts';
import { queryClient } from '@apis/config/queryClient';
import { HTTPMethod, request } from '@apis/config/request';

import { useToast } from '@components/toast/useToast';

import { API_ENDPOINT } from '@constants/apiEndpoints';
import { queryKeys } from '@constants/queryKey';
import { TOAST_MESSAGE } from '@constants/toastMessage';

import { ROUTES } from '@/routes/paths';

export const patchProfile = async (
  body: EditProfileRequest
): Promise<MyPageProfileResponse> => {
  return request<MyPageProfileResponse>({
    method: HTTPMethod.PATCH,
    url: API_ENDPOINT.USER.MYPAGE_PROFILE_EDIT,
    body: body,
  });
};

export const useEditProfileMutation = () => {
  const { notify } = useToast();
  const TOAST_OPTIONS = { toasterId: TOASTER_ID.BOTTOM_4 };
  const navigate = useNavigate();

  return useMutation<MyPageProfileResponse, Error, EditProfileRequest>({
    mutationFn: patchProfile,
    onSuccess: (updatedProfile, requestProfile) => {
      queryClient.setQueryData<MyPageProfileResponse>( // 프로필 수정 페이지 UI 반영
        queryKeys.mypage.profile(),
        (prevProfile) => ({
          ...prevProfile,
          ...updatedProfile,
          nickname: updatedProfile.nickname ?? requestProfile.nickname,
          birthday: updatedProfile.birthday ?? requestProfile.birthday,
          gender: updatedProfile.gender ?? requestProfile.gender,
        })
      );
      queryClient.setQueryData<MyPageUserData>( // 마이페이지 상단 이름 UI 반영
        queryKeys.mypage.user(),
        (prevUser) =>
          prevUser
            ? {
                ...prevUser,
                name:
                  updatedProfile.nickname ??
                  requestProfile.nickname ??
                  prevUser.name,
              }
            : prevUser
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.mypage.profile(),
      });

      navigate(ROUTES.MYPAGE);
      notify({
        text: TOAST_MESSAGE.PROFILE_EDIT_SUCCESS,
        type: TOAST_TYPE.INFO,
        options: TOAST_OPTIONS,
      });
    },
  });
};
