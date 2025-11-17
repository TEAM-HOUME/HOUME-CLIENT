import { overlay } from 'overlay-kit';

import GeneralModal from './GeneralModal';

const GeneralModalTest = () => {
  const handleOpen = () => {
    overlay.open(({ unmount }) => (
      <GeneralModal
        title="더 다양한 이미지가 궁금하신가요?"
        content={`새로운 취향과 정보를 반영해 다시 생성해보세요!\n이미지를 생성할 때마다 크레딧이 1개 소진돼요.`}
        cancelText="돌아가기"
        confirmText="이미지 새로 만들기"
        cancelVariant="default"
        confirmVariant="primary"
        creditCount={4}
        maxCredit={5}
        showCreditChip={true}
        onCancel={unmount}
        onConfirm={unmount}
        onClose={unmount}
      />
    ));
  };

  return (
    <div>
      <button type="button" onClick={handleOpen}>
        GeneralModal 열기
      </button>
    </div>
  );
};

export default GeneralModalTest;
