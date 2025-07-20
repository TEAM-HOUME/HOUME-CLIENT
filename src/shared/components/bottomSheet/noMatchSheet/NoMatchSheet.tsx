import { useRef, useState } from 'react';
import clsx from 'clsx';
import DragHandle from '@components/dragHandle/DragHandle';
import TextField from '@components/textField/TextField';
import CtaButton from '@components/button/ctaButton/CtaButton';
import * as styles from './NoMatchSheet.css';
import { useUserStore } from '@/store/useUserStore';

interface NoMatchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (region: string, address: string) => void;
  onExited?: () => void; // 애니메이션 끝나면 호출(unmount)
}

const NoMatchSheet = ({
  isOpen,
  onClose,
  onSubmit,
  onExited,
}: NoMatchSheetProps) => {
  // zustand에서 userName 가져오기
  const userName = useUserStore((state) => state.userName);

  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const isFilled = region.trim() !== '' && address.trim() !== '';

  // 1. ref 생성
  const sheetRef = useRef<HTMLDivElement | null>(null);

  // transitionend 핸들러
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // sheetWrapper에서만, 닫힐 때만 호출
    if (!isOpen && e.propertyName === 'transform') {
      onExited?.();
    }
  };

  const handleSubmit = () => {
    onSubmit(region, address);
  };

  return (
    <>
      <div
        className={clsx(styles.backdrop, isOpen && styles.backdropVisible)}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={clsx(
          styles.sheetWrapper,
          isOpen ? styles.sheetWrapperExpanded : styles.sheetWrapperCollapsed
        )}
        onClick={(e) => e.stopPropagation()}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className={styles.contentWapper}>
          <div className={styles.dragHandleContainer}>
            <DragHandle onClick={onClose} />
          </div>
          <div className={styles.infoTextContainer}>
            <span className={styles.infoText}>
              하우미는 점차 집 구조 템플릿을 <br />
              확대해 나갈 예정이에요!
            </span>
            <span className={styles.descriptionText}>
              아래 버튼을 통해 주소를 공유해주시면, <br />
              {userName ? `${userName}님의` : '사용자님의'} 스타일링을 위해
              빠르게 반영해드릴게요!
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
            <CtaButton onClick={handleSubmit} isActive={isFilled}>
              제출하기
            </CtaButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoMatchSheet;
