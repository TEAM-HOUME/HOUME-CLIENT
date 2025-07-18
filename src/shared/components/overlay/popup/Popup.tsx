import * as styles from './Popup.css';

interface PopupProps {
  onClose: () => void;
  onConfirm?: () => void; // 확인/나가기 버튼 클릭 시 호출
  title: string;
  detail: string;
  confirmText?: string;
  cancelText?: string;
}

const Popup = ({
  onClose,
  onConfirm,
  title,
  detail,
  confirmText = '나가기',
  cancelText = '취소',
}: PopupProps) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <dialog
        className={styles.container}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.info}>
          <span className={styles.title}>{title}</span>
          <span className={styles.detail}>{detail}</span>
        </div>

        <div className={styles.buttonBox}>
          <button type="button" className={styles.exit} onClick={handleConfirm}>
            {confirmText}
          </button>
          <button type="button" className={styles.cancel} onClick={onClose}>
            {cancelText}
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default Popup;
