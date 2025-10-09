import * as styles from './SmallButton.css';

interface SmallButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

const SmallButton = ({
  onClick,
  children = '이미지 더보기',
}: SmallButtonProps) => {
  return (
    <button className={styles.smallButton} onClick={onClick}>
      {children}
    </button>
  );
};

export default SmallButton;
