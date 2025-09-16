import { useToast } from './useToast';

const ToastTest = () => {
  const { notify } = useToast();

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <button
        type="button"
        onClick={() =>
          notify({
            text: '결제는 아직 준비 중인 기능이에요',
            type: 'success',
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
