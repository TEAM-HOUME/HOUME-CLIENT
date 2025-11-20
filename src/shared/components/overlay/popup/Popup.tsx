import * as styles from './Popup.css';

interface PopupProps {
  onClose: () => void;
  onExit?: () => void;
  title: string;
  detail: string;
}

const Popup = ({ onClose, onExit, title, detail }: PopupProps) => {
  const handleExit = () => {
    onClose();
    if (onExit) {
      onExit();
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
          <button type="button" className={styles.exit} onClick={handleExit}>
            나가기
          </button>
          <button type="button" className={styles.cancel} onClick={onClose}>
            계속 입력하기
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default Popup;
