import ErrorMessage from '@/shared/components/button/ErrorButton/ErrorMessage';
import LargeFilled from '@/shared/components/button/largeFilledButton/LargeFilledButton';

import * as styles from './ButtonGroup.css';

export interface ButtonOption {
  code: string;
  label: string;
  id?: number;
}

// 항상 code값을 반환함, id값이 필요한 경우 커스텀 훅에서 별도 로직으로 처리
export interface ButtonGroupProps {
  title?: string;
  titleSize?: 'small' | 'large';
  options: ButtonOption[];
  selectedValues: string[];
  onSelectionChange: (selectedValues: string[]) => void;
  selectionMode: 'single' | 'multiple';
  maxSelection?: number;
  buttonSize: 'xsmall' | 'small' | 'medium' | 'large';
  layout: 'grid-2' | 'grid-3' | 'grid-4';
  className?: string;
  hasBorder?: boolean;
  errors?: string;
  disabled?: boolean;
}

const ButtonGroup = ({
  title,
  titleSize,
  options,
  selectedValues,
  onSelectionChange,
  selectionMode,
  maxSelection,
  buttonSize,
  layout,
  hasBorder = false,
  errors,
}: ButtonGroupProps) => {
  const handleButtonClick = (buttonCode: string) => {
    if (selectionMode === 'single') {
      onSelectionChange([buttonCode]);
    } else {
      const isSelected = selectedValues.includes(buttonCode);

      if (isSelected) {
        // 선택 해제
        onSelectionChange(selectedValues.filter((code) => code !== buttonCode));
      } else {
        // 선택 추가
        if (maxSelection && selectedValues.length >= maxSelection) return;
        onSelectionChange([...selectedValues, buttonCode]);
      }
    }
  };

  return (
    <div className={styles.container({ hasBorder })}>
      {title && <p className={styles.title({ titleSize })}>{title}</p>}
      <div className={`${styles.buttonGroupStyles({ layout })}`}>
        {options.map((option) => (
          <LargeFilled
            key={String(option.code)}
            buttonSize={buttonSize}
            isSelected={selectedValues.includes(option.code)}
            // isActive={!option.disabled}
            onClick={() => handleButtonClick(option.code)}
          >
            {option.label}
          </LargeFilled>
        ))}
      </div>
      {errors && (
        <div className={styles.errorContainer}>
          <ErrorMessage message={errors} />
        </div>
      )}
    </div>
  );
};

export default ButtonGroup;
