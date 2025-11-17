import * as styles from './GeneralModal.css';
import CreditChip from '../../creditChip/CreditChip';

type ButtonVariant = 'default' | 'primary';

interface GeneralModalProps {
  title: string;
  content: string;
  onCancel: () => void; // 좌측 버튼 액션
  onConfirm: () => void; // 우측 버튼 액션
  onClose: () => void; // 모달 외부 영역 탭할 시 모달 닫기
  cancelText: string; // 좌측 버튼 텍스트
  confirmText: string; // 우측 버튼 텍스트
  cancelVariant: ButtonVariant; // 좌측 버튼 색깔(회색 or 보라색)
  confirmVariant: ButtonVariant; // 우측 버튼 색깔(회색 or 보라색)
  showCreditChip?: boolean;
  creditCount?: number;
  maxCredit?: number;
}

const GeneralModal = ({
  title,
  content,
  onCancel,
  onConfirm,
  onClose,
  cancelText,
  confirmText,
  cancelVariant,
  confirmVariant,
  showCreditChip = false,
  creditCount = 0,
  maxCredit = 0,
}: GeneralModalProps) => {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.container}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.contentArea}>
          <div className={styles.textBox}>
            <p className={styles.title}>{title}</p>
            <p className={styles.body}>{content}</p>
          </div>
          {showCreditChip && (
            <CreditChip creditCount={creditCount} maxCredit={maxCredit} />
          )}
        </div>
        <div className={styles.buttonArea}>
          <button
            type="button"
            className={styles.button({ variant: cancelVariant })}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={styles.button({ variant: confirmVariant })}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralModal;
