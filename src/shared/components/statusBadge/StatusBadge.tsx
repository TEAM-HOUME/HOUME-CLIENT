import * as styles from './StatusBadge.css';

interface StatusBadgeProps {
  label: string;
}

const StatusBadge = ({ label }: StatusBadgeProps) => {
  return <span className={styles.badge}>{label}</span>;
};

export default StatusBadge;
