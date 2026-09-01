import { useEffect, useId, useState } from 'react';

import TextButton from '@components/btnText/TextButton';

import * as styles from './SortDropdown.css';
import {
  COMPARE_SORT_OPTIONS,
  DEFAULT_COMPARE_SORT_OPTION,
  type CompareSortOption,
} from '../utils/sortCompareProducts';

interface CompareSortDropdownProps {
  disabled?: boolean;
  value?: CompareSortOption;
  onChange?: (option: CompareSortOption) => void;
}

const CompareSortDropdown = ({
  disabled = false,
  value = DEFAULT_COMPARE_SORT_OPTION,
  onChange,
}: CompareSortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const isDisabled = disabled || !onChange;

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className={styles.container}>
      <TextButton
        className={styles.pressable}
        color="secondary"
        size="s"
        rightIcon={isOpen ? 'ChevronUp' : 'ChevronDown'}
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        disabled={isDisabled}
        onClick={() => setIsOpen((open) => !open)}
      >
        {value}
      </TextButton>

      {isOpen ? (
        <>
          <button
            type="button"
            className={styles.backdrop}
            aria-label="정렬 메뉴 닫기"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
          />
          <div
            id={menuId}
            className={styles.menu}
            role="menu"
            aria-label="상품 정렬"
          >
            {COMPARE_SORT_OPTIONS.map((option) => {
              const isSelected = value === option;

              return (
                <div className={styles.item} key={option}>
                  <TextButton
                    className={styles.pressable}
                    color={isSelected ? 'primary' : 'secondary'}
                    size="s"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    onClick={() => {
                      onChange?.(option);
                      setIsOpen(false);
                    }}
                  >
                    {option}
                  </TextButton>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default CompareSortDropdown;
