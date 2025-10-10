import * as styles from './CurationButton.css';

interface CurationButtonProps extends React.ComponentProps<'button'> {}

const CurationButton = ({ ...props }: CurationButtonProps) => {
  return (
    <button type="button" className={styles.curationButton()} {...props}>
      <span className={styles.curationButtonText}>큐레이션 가구 보기</span>
      <svg
        className={styles.curationButtonIcon}
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4.91667 10.0846L9 6.0013L4.91667 1.91797"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default CurationButton;
