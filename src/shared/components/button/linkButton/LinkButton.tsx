import LinkIcon from '@assets/icons/icnLink.svg?react';

import * as styles from './LinkButton.css';
interface LinkButtonProps extends React.ComponentProps<'a'> {
  children?: React.ReactNode;
  typeVariant?: 'withText' | 'onlyIcon';
}

const LinkButton = ({
  children,
  typeVariant = 'withText',
  ...props
}: LinkButtonProps) => {
  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer" // 새 탭으로 열기
      className={styles.linkButton({
        type: typeVariant,
      })}
    >
      <LinkIcon />
      {children}
    </a>
  );
};

export default LinkButton;
