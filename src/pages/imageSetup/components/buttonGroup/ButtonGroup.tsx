import ErrorMessage from '@/shared/components/button/ErrorButton/ErrorMessage';
import LargeFilled from '@/shared/components/button/largeFilledButton/LargeFilledButton';

import * as styles from './ButtonGroup.css';

export interface ButtonOption {
  code: string;
  label: string;
  id?: number;
}

export interface ButtonStatus {
  id: number;
  isActive: boolean;
}

export interface ButtonGroupProps<T = string> {
  title?: string;
  titleSize?: 'small' | 'large';
  options: ButtonOption[];
  selectedValues: T[];
  onSelectionChange: (selectedValues: T[]) => void;
  keyExtractor?: (option: ButtonOption) => T;
  selectionMode: 'single' | 'multiple';
  maxSelection?: number;
  buttonSize: 'xsmall' | 'small' | 'medium' | 'large';
  layout: 'grid-2' | 'grid-3' | 'grid-4';
  className?: string;
  hasBorder?: boolean;
  errors?: string;
  disabled?: boolean;
  buttonStatuses?: ButtonStatus[];
}

const ButtonGroup = <T = string,>({
  title,
  titleSize,
  options,
  selectedValues,
  onSelectionChange,
  keyExtractor = (option: ButtonOption) => option.code as T, // 이미지 생성 요청 body에 필요한 값 추출
  selectionMode,
  maxSelection,
  buttonSize,
  layout,
  hasBorder = false,
  errors,
  buttonStatuses,
}: ButtonGroupProps<T>) => {
  const isButtonActive = (option: ButtonOption): boolean => {
    // 버튼 활성화 상태 확인
    const buttonStatus = buttonStatuses?.find(
      (status) => status.id === option.id
    );

    return buttonStatus?.isActive ?? true;
  };

  const handleButtonClick = (option: ButtonOption) => {
    if (!isButtonActive(option)) return;

    const value = keyExtractor(option);
    const isSelected = selectedValues.some(
      (selected) => String(selected) === String(value)
    );

    if (selectionMode === 'single') {
      if (isSelected) {
        // 선택 해제
        onSelectionChange([]);
      } else {
        // 새로운 선택
        onSelectionChange([value]);
      }
    } else {
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
          const value = keyExtractor(option);
          const isSelected = selectedValues.some(
            (selected) => String(selected) === String(value)
          );
          const isActive = isButtonActive(option); // 버튼 활성화 상태 확인 (id 기반)

          return (
            <LargeFilled
              key={
                option.id !== undefined
                  ? String(option.id)
                  : String(option.code)
              }
              buttonSize={buttonSize}
              isSelected={isSelected}
              isActive={isActive}
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
