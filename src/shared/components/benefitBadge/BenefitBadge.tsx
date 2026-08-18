import * as styles from './BenefitBadge.css';
import Icon from '../icon/Icon';

interface BenefitBadgeProps {
  amount: number;
}

const BenefitBadge = ({ amount }: BenefitBadgeProps) => (
  <span className={styles.badge}>
    <span className={styles.contents}>
      <Icon name="ArrowDownFillGreen" size="20" />
      <span className={styles.priceContainer}>
        <span className={styles.priceText}>
          {amount.toLocaleString('ko-KR')}
        </span>
        <span className={styles.priceText}>원 저렴</span>
      </span>
    </span>
  </span>
);

export default BenefitBadge;
