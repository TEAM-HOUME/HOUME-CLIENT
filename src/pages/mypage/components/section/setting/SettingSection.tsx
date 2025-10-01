import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '@/pages/login/apis/logout';
import Divider from '@/shared/components/divider/Divider';
import { useToast } from '@/shared/components/toast/useToast';
import { TOAST_TYPE } from '@/shared/types/toast';

// TODO: GeneralModal 머지 후 주석 해제
// import GeneralModal from '@/shared/components/modal/generalModal/GeneralModal';
import * as styles from './SettingSection.css';

const SettingSection = () => {
  const navigate = useNavigate();
  const { mutate: logout } = useLogoutMutation();
  const { notify } = useToast();
  // TODO: GeneralModal 머지 후 주석 해제
  // const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const handleServicePolicy = () => {
    navigate('/mypage/setting/service');
  };

  const handlePrivacyPolicy = () => {
    navigate('/mypage/setting/privacy');
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      notify({
        text: '로그아웃 되었습니다',
        type: TOAST_TYPE.INFO,
      });
    }
  };

  const handleWithdrawConfirm = () => {
    // TODO: 실제 회원 탈퇴 API 호출

    notify({
      text: '회원 탈퇴가 완료되었습니다',
      type: TOAST_TYPE.INFO,
    });

    // setIsWithdrawModalOpen(false);
    navigate('/');
  };

  const handleWithdraw = () => {
    // TODO: GeneralModal 머지 후 모달 사용으로 변경
    const confirmed = window.confirm(
      '정말 탈퇴하시겠어요?\n탈퇴 시 모든 데이터가 삭제되며, 복구할 수 없습니다.'
    );

    if (confirmed) {
      handleWithdrawConfirm();
    }

    // TODO: GeneralModal 머지 후 아래 코드 사용
    // setIsWithdrawModalOpen(true);
  };

  return (
    <>
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

      {/* TODO: GeneralModal 머지 후 주석 해제 */}
      {/* {isWithdrawModalOpen && (
        <GeneralModal
          title="정말 탈퇴하시겠어요?"
          content="탈퇴 시 모든 데이터가 삭제되며,\n복구할 수 없습니다."
          cancelText="취소"
          confirmText="그래도 탈퇴하기"
          cancelVariant="default"
          confirmVariant="primary"
          onCancel={() => setIsWithdrawModalOpen(false)}
          onConfirm={handleWithdrawConfirm}
          onClose={() => setIsWithdrawModalOpen(false)}
        />
      )} */}
    </>
  );
};

export default SettingSection;
