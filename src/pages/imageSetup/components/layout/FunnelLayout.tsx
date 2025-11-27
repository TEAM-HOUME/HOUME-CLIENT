import { overlay } from 'overlay-kit';
import { useNavigate } from 'react-router-dom';

import TitleNavBar from '@/shared/components/navBar/TitleNavBar';
import Popup from '@/shared/components/overlay/popup/Popup';

interface FunnelLayoutProps {
  children: React.ReactNode;
  currentStep: 'HouseInfo' | 'FloorPlan' | 'InteriorStyle' | 'ActivityInfo';
}

const FunnelLayout = ({ children, currentStep }: FunnelLayoutProps) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (currentStep === 'HouseInfo') {
      overlay.open(({ unmount }) => (
        <Popup
          onClose={unmount}
          onExit={() => navigate(-1)}
          title={`지금 나가면 무료로\n 이미지를 생성할 수 없어요`}
          detail={`이 페이지를 떠나면 지금까지 입력한 \n 정보와 함께 무료 토큰도 사라져요.`}
        />
      ));
    }
  };

  return (
    <div>
      <TitleNavBar
        title="스타일링 이미지 생성"
        isBackIcon={true}
        isLoginBtn={false}
        onBackClick={currentStep === 'HouseInfo' ? handleBackClick : undefined}
      />
      <div>{children}</div>
    </div>
  );
};

export default FunnelLayout;
