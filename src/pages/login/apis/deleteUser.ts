import { useMutation } from '@tanstack/react-query';

import { HTTPMethod, request } from '@/shared/apis/request';
import { useUserStore } from '@/store/useUserStore';

import { API_ENDPOINT } from '@constants/apiEndpoints';

/**
 * 회원탈퇴 응답 타입
 */
export interface DeleteUserResponse {
  code: number;
  msg: string;
  data: string;
}

/**
 * 회원탈퇴 API 함수
 *
 * 현재 로그인된 사용자의 계정을 삭제합니다.
 * 서버에 회원탈퇴 요청을 보내고, 성공 시 사용자 정보가 영구적으로 삭제됩니다.
 * 정책 상, 한 번 삭제된 회원은 절대 되돌릴 수 없으니 주의해주세요.
 *
 * @returns Promise<DeleteUserResponse> - 회원탈퇴 결과
 *
 * @example
 * ```typescript
 * const result = await deleteUser();
 * console.log(result.msg); // "회원 탈퇴 성공"
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
 * 회원탈퇴 성공 시 로컬 스토리지를 정리하고 홈으로 이동합니다.
 * 실패 시에도 사용자 데이터를 정리하여 보안을 유지합니다.
 *
 * @returns {UseMutationResult<DeleteUserResponse, Error, void>} 회원탈퇴 상태와 함수를 반환
 *
 * @example
 * ```typescript
 * const DeleteAccountButton = () => {
 *   const { mutate: deleteAccount, isPending } = useDeleteUserMutation();
 *
 *   const handleDelete = () => {
 *     if (confirm('정말로 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
 *       deleteAccount();
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
  return useMutation<DeleteUserResponse, Error, void>({
    mutationFn: deleteUser,
    onSettled: () => {
      // 성공/실패 관계없이 로컬 토큰 제거
      useUserStore.getState().clearUser();
    },
  });
};
