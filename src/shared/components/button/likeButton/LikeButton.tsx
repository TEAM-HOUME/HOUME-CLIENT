import { useState } from 'react';
import LikeIcon from '@assets/icons/likeIcon.svg?react';
import * as styles from './LikeButton.css';
interface LikeButtonProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
}

const LikeButton = ({ children, ...props }: LikeButtonProps) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    setIsSelected((prev) => !prev);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={styles.likeButton({
        selected: isSelected ? true : false,
      })}
      {...props}
    >
      <LikeIcon />
      {children}
    </button>
  );
};

export default LikeButton;
