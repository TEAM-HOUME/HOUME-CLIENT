import IcnCredit from '@/shared/assets/icons/icnCredit.svg?react';

import * as style from './CreditChip.css';

interface CreditChipProps {
  creditCount: number;
  maxCredit: number;
}

const CreditChip = ({ creditCount, maxCredit }: CreditChipProps) => {
  return (
    <div className={style.container}>
      <IcnCredit className={style.image} aria-hidden="true" focusable="false" />
      <p className={style.textWrapper}>
        <span className={style.text['primary']}>{creditCount}</span>
        <span className={style.text['default']}>/</span>
        <span className={style.text['default']}>{maxCredit}</span>
      </p>
    </div>
  );
};

export default CreditChip;
