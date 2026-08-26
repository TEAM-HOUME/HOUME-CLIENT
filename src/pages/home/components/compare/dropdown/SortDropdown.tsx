import { useEffect, useId, useRef, useState } from 'react';

import TextButton from '@components/btnText/TextButton';

import * as styles from './SortDropdown.css';

const SORT_OPTIONS = ['낮은 가격순', '높은 가격순', '추천순'] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

interface CompareSortDropdownProps {
  disabled?: boolean;
}

const CompareSortDropdown = ({
  disabled = false,
}: CompareSortDropdownProps) => {
  const [selectedOption, setSelectedOption] = useState<SortOption>(
    SORT_OPTIONS[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsidePointerDown);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointerDown);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={styles.container}>
      <TextButton
        color="secondary"
        size="s"
        rightIcon={isOpen ? 'ChevronUp' : 'ChevronDown'}
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
      >
        {selectedOption}
      </TextButton>

      {isOpen ? (
        <div
          id={menuId}
          className={styles.menu}
          role="menu"
          aria-label="상품 정렬"
        >
          {SORT_OPTIONS.map((option) => {
            const isSelected = selectedOption === option;

            return (
              <div className={styles.item} key={option}>
                <TextButton
                  color={isSelected ? 'primary' : 'secondary'}
                  size="s"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setSelectedOption(option);
                    setIsOpen(false);
                  }}
                >
                  {option}
                </TextButton>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default CompareSortDropdown;
