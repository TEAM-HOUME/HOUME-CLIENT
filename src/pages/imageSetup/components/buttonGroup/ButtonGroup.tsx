import ErrorMessage from '@/shared/components/button/ErrorButton/ErrorMessage';
import LargeFilled from '@/shared/components/button/largeFilledButton/LargeFilledButton';

import * as styles from './ButtonGroup.css';

export interface ButtonOption {
  code: string;
  label: string;
  id?: number;
}

export interface ButtonGroupProps<T = string> {
  title?: string;
  titleSize?: 'small' | 'large';
  options: ButtonOption[];
  selectedValues: T[];
  onSelectionChange: (selectedValues: T[]) => void;
  valueExtractor?: (option: ButtonOption) => T;
  selectionMode: 'single' | 'multiple';
  maxSelection?: number;
  buttonSize: 'xsmall' | 'small' | 'medium' | 'large';
  layout: 'grid-2' | 'grid-3' | 'grid-4';
  className?: string;
  hasBorder?: boolean;
  errors?: string;
  disabled?: boolean;
}

const ButtonGroup = <T = string,>({
  title,
  titleSize,
  options,
  selectedValues,
  onSelectionChange,
  valueExtractor = (option: ButtonOption) => option.code as T,
  selectionMode,
  maxSelection,
  buttonSize,
  layout,
  hasBorder = false,
  errors,
}: ButtonGroupProps<T>) => {
  const handleButtonClick = (option: ButtonOption) => {
    const value = valueExtractor(option);

    if (selectionMode === 'single') {
      onSelectionChange([value]);
    } else {
      const isSelected = selectedValues.some(
        (selected) => String(selected) === String(value)
      );

      if (isSelected) {
        // 선택 해제
        onSelectionChange(
          selectedValues.filter(
            (selected) => String(selected) !== String(value)
          )
        );
      } else {
        // 선택 추가
        if (maxSelection && selectedValues.length >= maxSelection) return;
        onSelectionChange([...selectedValues, value]);
      }
    }
  };

  return (
    <div className={styles.container({ hasBorder })}>
      {title && <p className={styles.title({ titleSize })}>{title}</p>}
      <div className={`${styles.buttonGroupStyles({ layout })}`}>
        {options.map((option) => {
          const value = valueExtractor(option);
          const isSelected = selectedValues.some(
            (selected) => String(selected) === String(value)
          );

          return (
            <LargeFilled
              key={String(option.code)}
              buttonSize={buttonSize}
              isSelected={isSelected}
              // isActive={!option.disabled}
              onClick={() => handleButtonClick(option)}
            >
              {option.label}
            </LargeFilled>
          );
        })}
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
