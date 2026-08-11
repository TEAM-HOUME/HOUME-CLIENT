import { createElement, useCallback, useState } from 'react';

import { overlay } from 'overlay-kit';

import { reportError, reportMessage } from '@shared/monitoring/report';
import { MONITORING_SCOPE } from '@shared/monitoring/scope';

import { useMyPageUserQuery } from '@apis/queries/useMyPageUserQuery';

import CreditRequestPopup from '@components/popup/CreditRequestPopup';

interface CreditGuardReturn {
  checkCredit: () => Promise<boolean>;
  hasEnoughCredit: boolean | undefined;
  isPending: boolean;
  isChecking: boolean;
  creditCount: number | undefined;
}

/**
 * 크레딧 확인 및 가드 처리 훅
 *
 * 이미지 생성 등 크레딧이 필요한 작업 전에 사용자의 크레딧을 확인하고,
 * 크레딧이 부족할 경우 요청 팝업을 표시합니다.
 *
 * @param requiredCredits 필요한 크레딧 수 (기본값: 1)
 * @returns 크레딧 확인 함수와 상태 정보
 */
export const useCreditGuard = (
  requiredCredits: number = 1
): CreditGuardReturn => {
  // 사용자 데이터 조회 (실시간으로 API 호출)
  const { data: userData, isPending, refetch } = useMyPageUserQuery();

  // 크레딧 확인 중 상태
  const [isChecking, setIsChecking] = useState(false);

  // 현재 크레딧 수
  const creditCount = userData?.CreditCount;

  const openCreditRequestPopup = useCallback((email?: string) => {
    overlay.open(({ unmount }) => {
      return createElement(CreditRequestPopup, {
        onClose: unmount,
        email,
      });
    });
  }, []);

  // 크레딧 충분 여부
  const hasEnoughCredit =
    creditCount !== undefined ? creditCount >= requiredCredits : undefined;

  /**
   * 크레딧 확인 함수
   *
   * 1. 최신 사용자 데이터를 다시 조회
   * 2. 크레딧 충분 여부 확인
   * 3. 부족 시 크레딧 요청 팝업 표시
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
        // 조회는 성공했는데 응답이 비어 생성이 차단된 상태.
        // 사용자는 퍼널을 다 밟고 CTA를 눌렀는데 아무 일도 일어나지 않는다.
        reportMessage('credit check returned no data', {
          scope: MONITORING_SCOPE.IMAGE_GENERATE,
          level: 'warning',
          fingerprint: ['credit-guard', 'no-data'],
          context: { required_credits: requiredCredits },
        });
        return false;
      }

      const currentCredit = latestUserData.CreditCount || 0;

      if (currentCredit >= requiredCredits) {
        return true;
      } else {
        openCreditRequestPopup(latestUserData.email);
        return false;
      }
    } catch (error) {
      // 크레딧이 실제로 있는데도 생성이 막히는 경우다.
      // 호출부(useActivityInfo)가 false를 받으면 CTA 버튼을 비활성화해 재시도도 불가능해진다.
      reportError(error, {
        scope: MONITORING_SCOPE.IMAGE_GENERATE,
        tags: { step: 'credit_check' },
        context: { required_credits: requiredCredits },
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, openCreditRequestPopup, requiredCredits, refetch]);

  return {
    checkCredit,
    hasEnoughCredit,
    isPending,
    isChecking,
    creditCount,
  };
};
