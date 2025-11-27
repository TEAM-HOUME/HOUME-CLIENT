import { useState } from 'react';

import { useMyPageUser } from '@/pages/mypage/hooks/useMypage';
import { useToast } from '@/shared/components/toast/useToast';
import { TOAST_TYPE } from '@/shared/types/toast';

export const useCreditCheck = () => {
  const { notify } = useToast();
  const [isCreditChecked, setIsCreditChecked] = useState(false);
  // ActivityInfo 첫 진입 시 CTA 버튼 항상 활성화
  // CTA 클릭 시 크레딧 체크 수행 및 CTA Button enable/disable 결정(checkCredit 함수)

  // 크레딧 정보 가져오기
  const { data: userData } = useMyPageUser();

  const creditCount = userData?.CreditCount ?? 0;
  const hasCredit = creditCount > 0; // 버튼 활성화 조건용

  const checkCredit = (): boolean => {
    setIsCreditChecked(true);

    if (creditCount === 0) {
      notify({
        text: '이미지 생성에 필요한 크레딧이 부족해요',
        type: TOAST_TYPE.INFO,
      });
      return false;
    }

    return true;
  };

  return {
    hasCredit,
    isCreditChecked,
    checkCredit,
  };
};
