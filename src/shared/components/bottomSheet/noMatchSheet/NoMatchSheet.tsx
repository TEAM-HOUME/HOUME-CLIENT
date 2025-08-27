import { useState } from 'react';
import TextField from '@components/textField/TextField';
import CtaButton from '@components/button/ctaButton/CtaButton';
import * as styles from './NoMatchSheet.css';
import { BottomSheetWrapper } from '../BottomSheetWrapper';
import { useUserStore } from '@/store/useUserStore';

interface NoMatchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
}

export const NoMatchSheet = ({
  isOpen,
  onClose,
  onExited,
}: NoMatchSheetProps) => {
  const userName = useUserStore((state) => state.userName);

  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const isFilled = region.trim() !== '' && address.trim() !== '';

  return (
    <BottomSheetWrapper
      isOpen={isOpen}
      onClose={onClose}
      onExited={onExited}
      threshold={150}
    >
      <div className={styles.infoTextContainer}>
        <span className={styles.infoText}>
          하우미는 점차 집 구조 템플릿을 <br />
          확대해 나갈 예정이에요!
        </span>
        <span className={styles.descriptionText}>
          아래 버튼을 통해 주소를 공유해주시면, <br />
          {userName ? `${userName}님의` : '사용자님의'} 스타일링을 위해 빠르게
          반영해드릴게요!
        </span>
      </div>
      <div className={styles.fieldWrapper}>
        <div className={styles.fieldContainer}>
          <p className={styles.title}>시/군/구</p>
          <TextField
            fieldSize="thin"
            placeholder="ex) 솝트특별자치시 앱잼구"
            value={region}
            onChange={setRegion}
          />
        </div>
        <div className={styles.fieldContainer}>
          <p className={styles.title}>상세 주소</p>
          <TextField
            fieldSize="thin"
            placeholder="ex) 하우미로 123"
            value={address}
            onChange={setAddress}
          />
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <CtaButton
          onClick={() => {
            if (isFilled) {
              console.log('Form submitted:', { region, address });
            }
          }}
          disabled={!isFilled}
        >
          제출하기
        </CtaButton>
      </div>
    </BottomSheetWrapper>
  );
};

export default NoMatchSheet;
