import { overlay } from 'overlay-kit';

import Popup from './Popup';

const PopupTest = () => {
  const handleOpen = () => {
    overlay.open(({ unmount }) => (
      <Popup
        onClose={unmount}
        title={`지금 나가면\n 무료 토큰 1개가 사라져요!`}
        detail={`조금만 더 입력하면 이미지를 받을 수 있어요.\n나가면 입력한 내용과 함께 토큰도 소진돼요.`}
      />
    ));
  };
  return (
    <div>
      <button type="button" onClick={handleOpen}>
        팝업창 열기
      </button>
    </div>
  );
};

export default PopupTest;
