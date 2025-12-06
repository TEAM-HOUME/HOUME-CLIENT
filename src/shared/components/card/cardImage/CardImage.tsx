import { useState } from 'react';

import * as styles from './CardImage.css.ts';

interface CardImageProps extends React.ComponentProps<'div'> {
  src: string;
  alt: string;
  selectOrder?: number;
  disabled?: boolean;
  onClick?: () => void;
}

const CardImage = ({
  src,
  selectOrder = 0,
  disabled = false,
  onClick,
}: CardImageProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const isSelected = selectOrder > 0;

  // 상태 결정: disabled > pressed > selected > default
  const visualState = disabled
    ? 'disabled'
    : isPressed
      ? 'pressed'
      : isSelected
        ? 'selected'
        : 'default';

  const handleMouseDown = () => {
    if (disabled) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (disabled) return;
    setIsPressed(false);
  };

  const handleClick = () => {
    if (disabled) return;
    onClick?.(); // 클릭 시 이미지 선택 함수 호출
  };

  return (
    <div
      className={styles.cardcontainer({ state: visualState })}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      <img
        src={src}
        className={disabled ? styles.disabledcardimg : styles.cardimg}
        alt="카드 이미지"
        crossOrigin="anonymous"
      />
      {visualState !== 'disabled' && (
        <button
          type="button"
          className={styles.checkbox({ state: visualState })}
        >
          {visualState === 'selected' ? selectOrder : ''}
        </button>
      )}
    </div>
  );
};

export default CardImage;
