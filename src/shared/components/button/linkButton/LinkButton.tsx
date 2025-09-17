import LinkIcon from '@assets/icons/icnLink.svg?react';

import * as styles from './LinkButton.css';
interface LinkButtonProps extends React.ComponentProps<'button'> {
  children?: React.ReactNode;
  typeVariant?: 'withText' | 'onlyIcon';
}

const LinkButton = ({
  children,
  typeVariant = 'withText',
  ...props
}: LinkButtonProps) => {
  return (
    <button
      type="button"
      className={styles.linkButton({
        type: typeVariant,
      })}
      {...props}
    >
      <LinkIcon />
      {children}
    </button>
  );
};

export default LinkButton;
