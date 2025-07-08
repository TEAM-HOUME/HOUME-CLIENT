import * as styles from './chargeBtn.css';

interface ChargeButtonProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
  isActive?: boolean;
}

const ChargeButton = ({
  children,
  isActive = true,
  ...props
}: ChargeButtonProps) => {
  return (
    <button
      type="button"
      className={styles.chargeButton({
        state: isActive ? 'active' : 'disabled',
      })}
      {...props}
    >
      {children}
    </button>
  );
};

export default ChargeButton;
