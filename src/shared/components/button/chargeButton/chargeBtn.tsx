import * as styles from './chargeBtn.css';

interface ChargeButtonProps extends React.ComponentProps<'button'> {
  isActive?: boolean;
}

const ChargeButton = ({ isActive = true }: ChargeButtonProps) => {
  return (
    <button
      type="button"
      className={styles.chargeButton({
        state: isActive ? 'active' : 'disabled',
      })}
    >
      충전하기
    </button>
  );
};

export default ChargeButton;
