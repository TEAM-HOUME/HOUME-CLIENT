import clsx from 'clsx';

import * as styles from './SmallFilledButton.css';

interface SmallFilledButtonProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
  isSelected: boolean;
}

const SmallFilledButton = ({
  children,
  isSelected,
  ...props
}: SmallFilledButtonProps) => {
  return (
    <div
      className={clsx(
        styles.smallButtonBase,
        styles.smallButtonVariants[isSelected ? 'on' : 'off']
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default SmallFilledButton;
