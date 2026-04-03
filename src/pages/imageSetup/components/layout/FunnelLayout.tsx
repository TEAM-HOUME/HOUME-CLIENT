import { overlay } from 'overlay-kit';
import { useNavigate } from 'react-router-dom';

import TitleNavBar from '@components/navBar/TitleNavBar';
import Popup from '@components/overlay/popup/Popup';

import * as styles from './FunnelLayout.css';
import {
  logSelectHouseInfoClickModalContinue,
  logSelectHouseInfoClickModalExit,
  logSelectHouseInfoViewModal,
} from '../../utils/analytics';

interface FunnelLayoutProps {
  children: React.ReactNode;
  currentStep: 'FloorPlanSelect' | 'InteriorStyle' | 'ActivityInfo';
}

const FunnelLayout = ({ children, currentStep }: FunnelLayoutProps) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (currentStep === 'FloorPlanSelect') {
      logSelectHouseInfoViewModal();

      overlay.open(({ unmount }) => (
        <Popup
          onClose={() => {
            logSelectHouseInfoClickModalContinue();
            unmount();
          }}
          onExit={() => {
            logSelectHouseInfoClickModalExit();
            navigate(-1);
          }}
          title={`지금 나가면 무료로\n 이미지를 생성할 수 없어요`}
          detail={`이 페이지를 떠나면 지금까지 입력한 \n 정보와 함께 무료 토큰도 사라져요.`}
        />
      ));
    }
  };

  return (
    <div className={styles.wrapper}>
      <TitleNavBar
        // TODO: 각 스텝별 헤더 타이틀 설정하기
        title="스타일링 이미지 생성"
        isBackIcon={true}
        isLoginBtn={false}
        onBackClick={
          currentStep === 'FloorPlanSelect' ? handleBackClick : undefined
        }
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default FunnelLayout;
