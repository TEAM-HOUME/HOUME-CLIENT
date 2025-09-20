import LargeFilled from '@/shared/components/button/largeFilledButton/LargeFilledButton';

import * as styles from './ButtonGroup.css';

export interface ButtonOption {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface ButtonGroupProps {
  options: ButtonOption[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  selectionMode: 'single' | 'multiple';
  maxSelection?: number;
  buttonSize: 'xsmall' | 'small' | 'medium' | 'large';
  layout: 'grid-2' | 'grid-3' | 'grid-4';
  className?: string;
}

const ButtonGroup = ({
  options,
  selectedIds,
  onSelectionChange,
  selectionMode,
  maxSelection,
  buttonSize,
  layout,
}: ButtonGroupProps) => {
  const handleButtonClick = (buttonId: string) => {
    if (selectionMode == 'single') {
      onSelectionChange([buttonId]);
    } else {
      const isSelected = selectedIds.includes(buttonId);

      if (isSelected) {
        // 선택 해제
        onSelectionChange(selectedIds.filter((id) => id !== buttonId));
      } else {
        // 선택 추가
        if (maxSelection && selectedIds.length >= maxSelection) return;
        onSelectionChange([...selectedIds, buttonId]);
      }
    }
  };

  return (
    <div className={`${styles.buttonGroupStyles({ layout })}`}>
      {options.map((option) => (
        <LargeFilled
          key={option.id}
          buttonSize={buttonSize}
          isSelected={selectedIds.includes(option.id)}
          isActive={!option.disabled}
          onClick={() => handleButtonClick(option.id)}
        >
          {option.label}
        </LargeFilled>
      ))}
    </div>
  );
};

export default ButtonGroup;
