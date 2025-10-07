import { overlay } from 'overlay-kit';
import { useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '@/pages/login/apis/logout';
import { ROUTES } from '@/routes/paths';
import Divider from '@/shared/components/divider/Divider';
import TitleNavBar from '@/shared/components/navBar/TitleNavBar';
import GeneralModal from '@/shared/components/overlay/modal/GeneralModal';
import { useToast } from '@/shared/components/toast/useToast';
import { TOAST_TYPE } from '@/shared/types/toast';

import * as styles from './SettingPage.css';

const SettingPage = () => {
  const navigate = useNavigate();
  const { mutate: logout } = useLogoutMutation();
  const { notify } = useToast();

  const handleServicePolicy = () => {
    navigate(ROUTES.SETTING_SERVICE);
  };

  const handlePrivacyPolicy = () => {
    navigate(ROUTES.SETTING_PRIVACY);
  };

  const handleLogout = () => {
    notify({
      text: '로그아웃 되었습니다',
      type: TOAST_TYPE.INFO,
    });

    setTimeout(() => {
      logout(undefined, {
        onSuccess: () => {
          navigate(ROUTES.HOME);
        },
      });
    }, 1500); // 1.5초 후 로그아웃 실행
  };

  const handleWithdrawConfirm = () => {
    // TODO: 실제 회원 탈퇴 API 호출

    notify({
      text: '회원 탈퇴가 완료되었습니다',
      type: TOAST_TYPE.INFO,
    });

    navigate(ROUTES.HOME);
  };

  const handleWithdraw = () => {
    overlay.open(({ unmount }) => (
      <GeneralModal
        title="하우미 탈퇴 전 확인하세요"
        content={
          '탈퇴 시 생성했던 이미지와 함께\n모든 정보가 삭제되며, 복구가 불가능해요.'
        }
        cancelText="탈퇴하기"
        confirmText="취소하기"
        cancelVariant="default"
        confirmVariant="default"
        onCancel={() => {
          handleWithdrawConfirm();
          unmount();
        }}
        onConfirm={unmount}
        onClose={unmount}
      />
    ));
  };

  return (
    <>
      <TitleNavBar
        title="설정"
        isBackIcon
        isLoginBtn={false}
        onBackClick={() => navigate(-1)}
      />

      <div className={styles.container}>
        {/* 약관 및 정책 섹션 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>약관 및 정책</h2>
          <div className={styles.buttonArea}>
            <div className={styles.buttonItem}>
              <Divider />
              <button
                type="button"
                className={styles.settingButton}
                onClick={handleServicePolicy}
                aria-label="서비스 이용 약관"
              >
                <span className={styles.buttonText}>서비스 이용 약관</span>
              </button>
            </div>
            <div className={styles.buttonItem}>
              <Divider />
              <button
                type="button"
                className={styles.settingButton}
                onClick={handlePrivacyPolicy}
                aria-label="개인정보 처리방침"
              >
                <span className={styles.buttonText}>개인정보 처리방침</span>
              </button>
              <Divider />
            </div>
          </div>
        </section>

        {/* 계정 설정 섹션 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>계정 설정</h2>
          <div className={styles.buttonArea}>
            <div className={styles.buttonItem}>
              <Divider />
              <button
                type="button"
                className={styles.settingButton}
                onClick={handleLogout}
                aria-label="로그아웃"
              >
                <span className={styles.buttonText}>로그아웃</span>
              </button>
            </div>
            <div className={styles.buttonItem}>
              <Divider />
              <button
                type="button"
                className={styles.settingButton}
                onClick={handleWithdraw}
                aria-label="탈퇴하기"
              >
                <span className={styles.buttonText}>탈퇴하기</span>
              </button>
              <Divider />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SettingPage;
