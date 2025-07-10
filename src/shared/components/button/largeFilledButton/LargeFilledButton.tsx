import { useState } from 'react';
import * as styles from './LargeFilledButton.css';

interface LargeFilledProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
  isActive?: boolean;
  isError?: boolean;
}

const LargeFilled = ({
  children,
  isActive = true,
  isError,
  ...props
}: LargeFilledProps) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    setIsSelected((prev) => !prev);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={styles.largeFilled({
        state: isError ? 'error' : isActive ? 'active' : 'disabled',
        selected: isSelected ? true : false,
      })}
      {...props}
    >
      {children}
    </button>
  );
};

export default LargeFilled;
