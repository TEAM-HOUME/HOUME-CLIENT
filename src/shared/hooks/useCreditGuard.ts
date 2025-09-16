import { useCallback, useState } from 'react';

import { useMyPageUser } from '@/pages/mypage/hooks/useMypage';
import { useToast } from '@/shared/components/toast/useToast';

import { TOAST_TYPE } from '../types/toast';

interface CreditGuardReturn {
  checkCredit: () => Promise<boolean>;
  hasEnoughCredit: boolean | undefined;
  isLoading: boolean;
  isChecking: boolean;
  creditCount: number | undefined;
}

/**
 * 크레딧 확인 및 가드 처리 훅
 *
 * 이미지 생성 등 크레딧이 필요한 작업 전에 사용자의 크레딧을 확인하고,
 * 크레딧이 부족할 경우 토스트 알림을 표시합니다.
 *
 * @param requiredCredits 필요한 크레딧 수 (기본값: 1)
 * @returns 크레딧 확인 함수와 상태 정보
 */
export const useCreditGuard = (
  requiredCredits: number = 1
): CreditGuardReturn => {
  // 사용자 데이터 조회 (실시간으로 API 호출)
  const { data: userData, isLoading, refetch } = useMyPageUser();

  // 토스트 알림 훅
  const { notify } = useToast();

  // 크레딧 확인 중 상태
  const [isChecking, setIsChecking] = useState(false);

  // 현재 크레딧 수
  const creditCount = userData?.CreditCount;

  // 크레딧 충분 여부
  const hasEnoughCredit =
    creditCount !== undefined ? creditCount >= requiredCredits : undefined;

  /**
   * 크레딧 확인 함수
   *
   * 1. 최신 사용자 데이터를 다시 조회
   * 2. 크레딧 충분 여부 확인
   * 3. 부족 시 토스트 알림 표시
   *
   * @returns 크레딧이 충분한지 여부
   */
  const checkCredit = useCallback(async (): Promise<boolean> => {
    if (isChecking) return false; // 이미 확인 중이면 중복 호출 방지

    setIsChecking(true);
    try {
      // 최신 데이터 다시 조회
      const { data: latestUserData } = await refetch();

      if (!latestUserData) {
        notify({
          text: '정보를 불러올 수 없습니다.',
          type: TOAST_TYPE.WARNING,
        });
        return false;
      }

      const currentCredit = latestUserData.CreditCount || 0;

      if (currentCredit >= requiredCredits) {
        return true;
      } else {
        // 크레딧 부족 시 토스트 알림
        notify({
          text: `크레딧이 부족합니다.`,
          type: TOAST_TYPE.WARNING,
        });
        return false;
      }
    } catch (error) {
      console.error('[useCreditGuard] 크레딧 확인 실패:', error);
      notify({
        text: '크레딧 확인에 실패했습니다.',
        type: TOAST_TYPE.WARNING,
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, requiredCredits, refetch, notify]);

  return {
    checkCredit,
    hasEnoughCredit,
    isLoading,
    isChecking,
    creditCount,
  };
};
