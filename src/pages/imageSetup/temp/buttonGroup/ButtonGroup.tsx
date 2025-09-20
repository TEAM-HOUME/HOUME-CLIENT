import LargeFilled from '@/shared/components/button/largeFilledButton/LargeFilledButton';

import * as styles from './ButtonGroup.css';

export interface ButtonOption {
  id?: number;
  code: string;
  label: string;
  disabled?: boolean;
}

export interface ButtonGroupProps {
  title?: string;
  titleSize?: 'small' | 'large';
  options: ButtonOption[];
  selectedCodes: string[];
  onSelectionChange: (selectedCodes: string[]) => void;
  selectionMode: 'single' | 'multiple';
  maxSelection?: number;
  buttonSize: 'xsmall' | 'small' | 'medium' | 'large';
  layout: 'grid-2' | 'grid-3' | 'grid-4';
  className?: string;
  hasBorder?: boolean;
}

const ButtonGroup = ({
  title,
  titleSize,
  options,
  selectedCodes,
  onSelectionChange,
  selectionMode,
  maxSelection,
  buttonSize,
  layout,
  hasBorder = false,
}: ButtonGroupProps) => {
  const handleButtonClick = (buttonCode: string) => {
    if (selectionMode == 'single') {
      onSelectionChange([buttonCode]);
    } else {
      const isSelected = selectedCodes.includes(buttonCode);

      if (isSelected) {
        // 선택 해제
        onSelectionChange(selectedCodes.filter((code) => code !== buttonCode));
      } else {
        // 선택 추가
        if (maxSelection && selectedCodes.length >= maxSelection) return;
        onSelectionChange([...selectedCodes, buttonCode]);
      }
    }
  };

  return (
    <div className={styles.container({ hasBorder })}>
      {title && <p className={styles.title({ titleSize })}>{title}</p>}
      <div className={`${styles.buttonGroupStyles({ layout })}`}>
        {options.map((option) => (
          <LargeFilled
            key={option.code}
            buttonSize={buttonSize}
            isSelected={selectedCodes.includes(option.code)}
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
