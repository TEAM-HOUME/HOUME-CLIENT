import LargeFilled from '@/shared/components/button/largeFilledButton/LargeFilledButton';

import * as styles from './ButtonGroup.css';

export interface ButtonOption<T = string> {
  code: T;
  label: string;
  id?: number;
  disabled?: boolean;
}

export interface ButtonGroupProps<T = string> {
  title?: string;
  titleSize?: 'small' | 'large';
  options: ButtonOption<T>[];
  selectedValues: T[];
  onSelectionChange: (selectedValues: T[]) => void;
  selectionMode: 'single' | 'multiple';
  maxSelection?: number;
  buttonSize: 'xsmall' | 'small' | 'medium' | 'large';
  layout: 'grid-2' | 'grid-3' | 'grid-4';
  className?: string;
  hasBorder?: boolean;
}

const ButtonGroup = <T = string,>({
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
}: ButtonGroupProps<T>) => {
  const handleButtonClick = (buttonCode: T) => {
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
            isActive={!option.disabled}
            onClick={() => handleButtonClick(option.code)}
          >
            {option.label}
          </LargeFilled>
        ))}
      </div>
    </div>
  );
};

export default ButtonGroup;
