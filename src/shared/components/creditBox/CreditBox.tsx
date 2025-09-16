import { useState } from 'react';

import { TOAST_TYPE } from '@/shared/types/toast';

import ChargeButton from '@components/button/chargeButton/ChargeButton';

import * as styles from './CreditBox.css';
import { useToast } from '../toast/useToast';

interface CreditBoxProps {
  credit: number;
  disabled?: boolean;
}
const CreditBox = ({ credit, disabled = false }: CreditBoxProps) => {
  const { notify } = useToast();
  const [isChargeDisabled, setIsChargeDisabled] = useState(false);

  const handleChargeClick = () => {
    if (isChargeDisabled || disabled) return; // 추가 가드 조건

    setIsChargeDisabled(true); // 먼저 비활성화

    notify({
      text: '결제는 아직 준비 중인 기능이에요',
      type: TOAST_TYPE.WARNING,
      options: {
        style: { marginBottom: '2rem' },
      },
    });
  };

  return (
    <div className={styles.boxWrapper}>
      <div className={styles.contentWrapper}>
        <div className={styles.textContainer}>
          <span className={styles.infoText} id="credit-label">
            보유 크레딧
          </span>
          <span className={styles.creditText} aria-labelledby="credit-label">
            {credit}
          </span>
        </div>
        <ChargeButton
          disabled={disabled || isChargeDisabled}
          onClick={handleChargeClick}
          isActive={!isChargeDisabled}
        >
          충전하기
        </ChargeButton>
      </div>
    </div>
  );
};

export default CreditBox;
