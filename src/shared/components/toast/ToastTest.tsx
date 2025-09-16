import { TOAST_TYPE } from '@/shared/types/toast';

import { useToast } from './useToast';

const ToastTest = () => {
  const { notify } = useToast();

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <button
        type="button"
        onClick={() =>
          notify({
            text: '상품을 찜했어요! 위시리스트로 이동할까요?',
            type: TOAST_TYPE.WARNING,
            onClick: () => {
              console.log('토스트 클릭');
            },
            options: {
              style: {
                marginBottom: '5rem',
              },
            },
          })
        }
      >
        토스트 띄우기
      </button>
    </div>
  );
};

export default ToastTest;
