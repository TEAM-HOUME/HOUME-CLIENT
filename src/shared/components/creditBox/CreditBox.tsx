import ChargeButton from '@components/button/chargeButton/ChargeButton';
import * as styles from './CreditBox.css';

interface CreditBoxProps {
  credit: number;
}
const CreditBox = ({ credit }: CreditBoxProps) => {
  return (
    <div className={styles.boxWrapper}>
      <div className={styles.textContainer}>
        <span className={styles.infoText} id="credit-label">
          보유 크레딧
        </span>
        <span className={styles.creditText} aria-labelledby="credit-label">
          {credit}
        </span>
      </div>
      <ChargeButton>충전하기</ChargeButton>
    </div>
  );
};

export default CreditBox;
