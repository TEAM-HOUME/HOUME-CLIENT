import { overlay } from 'overlay-kit';

import CreditModal from './CreditModal';

const OverlayTest = () => {
  const handleOpen = () => {
    overlay.open(({ unmount }) => (
      <CreditModal
        onClose={unmount}
        title={`스타일링 이미지대로 가구를\n추천 받으려면 크레딧이 필요해요`}
      />
    ));
  };

  return (
    <div>
      <button type="button" onClick={handleOpen}>
        모달창 열기
      </button>
    </div>
  );
};

export default OverlayTest;
