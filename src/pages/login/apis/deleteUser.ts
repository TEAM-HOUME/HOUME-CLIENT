import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/routes/paths';
import { queryClient } from '@/shared/apis/queryClient';
import { HTTPMethod, request } from '@/shared/apis/request';
import { useToast } from '@/shared/components/toast/useToast';
import { TOAST_TYPE } from '@/shared/types/toast';
import { useUserStore } from '@/store/useUserStore';

import { API_ENDPOINT } from '@constants/apiEndpoints';

/**
 * 회원탈퇴 응답 타입
 * request 함수는 BaseResponse<T>의 data 필드만 반환하므로,
 * 서버가 반환하는 data 타입만 정의합니다.
 */
export type DeleteUserResponse = string;

/**
 * 회원탈퇴 API 함수
 *
 * 현재 로그인된 사용자의 계정을 삭제합니다.
 * 서버에 회원탈퇴 요청을 보내고, 성공 시 사용자 정보가 영구적으로 삭제됩니다.
 * 정책 상, 한 번 삭제된 회원은 절대 되돌릴 수 없으니 주의해주세요.
 *
 * @returns Promise<DeleteUserResponse> - 회원탈퇴 결과 메시지
 *
 * @example
 * ```typescript
 * const result = await deleteUser();
 * console.log(result); // "회원이 정상적으로 삭제되었습니다."
 * ```
 */
export const deleteUser = async (): Promise<DeleteUserResponse> => {
  return request<DeleteUserResponse>({
    method: HTTPMethod.DELETE,
    url: API_ENDPOINT.USER.DELETE, // '/api/v1/user'
  });
};

/**
 * 회원탈퇴 React Query 훅
 *
 * 사용자 회원탈퇴를 처리하는 TanStack Query mutation 훅입니다.
 * 모든 성공/에러 처리를 훅 내부에서 통합 관리하여 재사용성을 높였습니다.
 * 컴포넌트에서는 단순히 deleteUser() 호출만 하면 됩니다.
 *
 * @returns {UseMutationResult<DeleteUserResponse, Error, void>} 회원탈퇴 상태와 함수를 반환
 *
 * @example
 * ```typescript
 * const DeleteAccountButton = () => {
 *   const { mutate: deleteAccount, isPending } = useDeleteUserMutation();
 *
 *   const handleDelete = () => {
 *     if (confirm('정말로 회원탈퇴 하시겠습니까?')) {
 *       deleteAccount(); // 모든 처리는 훅 내부에서!
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={isPending}>
 *       {isPending ? '처리 중...' : '회원탈퇴'}
 *     </button>
 *   );
 * };
 * ```
 */
export const useDeleteUserMutation = () => {
  const navigate = useNavigate();
  const { notify } = useToast();

  return useMutation<DeleteUserResponse, Error, void>({
    mutationFn: deleteUser,
    retry: false,
    onSuccess: (data) => {
      console.log('회원탈퇴 성공:', data);

      // 성공 토스트 표시
      notify({
        text: '탈퇴되었습니다',
        type: TOAST_TYPE.INFO,
        options: { autoClose: 2500 },
      });

      // 홈으로 이동
      navigate(ROUTES.HOME, { replace: true });

      // 네비게이션 완료 후 토큰 삭제 및 React Query 캐시 정리 (100ms 지연)
      setTimeout(() => {
        useUserStore.getState().clearUser();
        // React Query 캐시 전체 정리
        queryClient.clear();
      }, 100);
    },
    onError: (error) => {
      console.error('회원탈퇴 실패:', error);

      // 에러 토스트 표시
      notify({
        text: '탈퇴에 실패했습니다. 다시 시도해주세요.',
        type: TOAST_TYPE.WARNING,
        options: { autoClose: 2500 },
      });
    },
  });
};
