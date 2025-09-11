import React from 'react';

import Step1Icon from '@shared/assets/icons/step1Icon.svg?react';
import Step2Icon from '@shared/assets/icons/step2Icon.svg?react';
import Step3Icon from '@shared/assets/icons/step3Icon.svg?react';
import Step4Icon from '@shared/assets/icons/step4Icon.svg?react';

import * as styles from './ProgressBarKey.css';

import type { ProgressBarKeyProps } from './ProgressBarKey.types';

const ProgressBarKey = React.memo(({ currentStep }: ProgressBarKeyProps) => {
  const normalizedStep = Math.max(1, Math.min(4, currentStep));

  const renderIcon = () => {
    const commonProps = {
      className: styles.icon({ variant: 'active' }),
      'aria-hidden': true,
    };

    switch (normalizedStep) {
      case 1:
        return <Step1Icon {...commonProps} />;
      case 2:
        return <Step2Icon {...commonProps} />;
      case 3:
        return <Step3Icon {...commonProps} />;
      case 4:
        return <Step4Icon {...commonProps} />;
    }
  };

  return (
    <div className={styles.stepsWrapper}>
      <div className={styles.step}>{renderIcon()}</div>
    </div>
  );
});

ProgressBarKey.displayName = 'ProgressBarKey';

export default ProgressBarKey;
