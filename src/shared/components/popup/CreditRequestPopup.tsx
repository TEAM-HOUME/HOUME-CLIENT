import * as styles from './CreditRequestPopup.css';
import Popup from './Popup';

const CREDIT_REQUEST_BASE_URL = 'https://tally.so/r/gDrdYO';

const getCreditRequestUrl = (email?: string) => {
  if (!email) return CREDIT_REQUEST_BASE_URL;

  const url = new URL(CREDIT_REQUEST_BASE_URL);
  url.searchParams.set('email', email);
  return url.toString();
};

interface CreditRequestPopupProps {
  onClose: () => void;
  email?: string;
}

const CreditRequestPopup = ({ onClose, email }: CreditRequestPopupProps) => {
  const handleRequestCredit = () => {
    window.open(getCreditRequestUrl(email), '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Popup
      btnStyle="text"
      btnText="크레딧 요청하기"
      weakBtnText="그만 두기"
      topIconName="WarningFillDanger"
      ariaLabel="크레딧 부족 안내"
      containerSize="creditRequest"
      onClose={onClose}
      onCancel={onClose}
      onConfirm={handleRequestCredit}
      content={
        <div className={styles.content}>
          <h3 className={styles.title}>크레딧을 모두 소진했어요!</h3>
          <p className={styles.detail}>
            크레딧이 더 필요하다면 요청해주세요.
            <br />
            개발팀에서 확인 후 지급해드려요.
          </p>
        </div>
      }
    />
  );
};

export default CreditRequestPopup;
