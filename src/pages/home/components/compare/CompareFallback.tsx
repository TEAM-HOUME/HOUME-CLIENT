// [임시 파일] empty·error 화면 시안이 나오면 각각의 컴포넌트로 교체
import ActionButton from '@components/button/actionButton/ActionButton';

import * as styles from './CompareFallback.css';

interface CompareFallbackProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * 결과 0건·실패 화면 자리를 채우는 임시 컴포넌트.
 * 두 화면의 디자인 시안이 아직 없어 문구만 보여준다. 시안이 나오면 각각의 컴포넌트로 교체한다.
 */
const CompareFallback = ({
  title,
  description,
  actionLabel,
  onAction,
}: CompareFallbackProps) => {
  return (
    <div className={styles.container}>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <ActionButton variant="outlined" size="S" onClick={onAction}>
          {actionLabel}
        </ActionButton>
      )}
    </div>
  );
};

export default CompareFallback;
