import { useRef } from 'react';

import { overlay } from 'overlay-kit';
import { useNavigate } from 'react-router-dom';

import { useDeleteUserMutation } from '@/pages/login/apis/deleteUser';
import { useLogoutMutation } from '@/pages/login/apis/logout';
import { ROUTES } from '@/routes/paths';
import TitleNavBar from '@/shared/components/navBar/TitleNavBar';
import GeneralModal from '@/shared/components/overlay/modal/GeneralModal';
import { useToast } from '@/shared/components/toast/useToast';
import { TOAST_TYPE } from '@/shared/types/toast';

import * as styles from './SettingPage.css';

const SettingPage = () => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { mutate: logout } = useLogoutMutation();
  const { mutate: deleteUser } = useDeleteUserMutation();
  const logoutTimerRef = useRef<number | null>(null);

  const handleServicePolicy = () => {
    navigate(ROUTES.SETTING_SERVICE);
  };

  const handlePrivacyPolicy = () => {
    navigate(ROUTES.SETTING_PRIVACY);
  };

  const handleLogout = () => {
    // 1) 토스트 표시 (2.5초 유지)
    notify({
      text: '로그아웃 되었습니다',
      type: TOAST_TYPE.INFO,
      options: { autoClose: 2500 },
    });

    // 2) 보호 라우트 리다이렉트 경쟁을 피하기 위해 먼저 홈으로 이동
    navigate(ROUTES.HOME, { replace: true });

    // 기존 타이머가 있으면 제거하고, 새 타이머로 갱신
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    logoutTimerRef.current = window.setTimeout(() => {
      // 전역 훅(useLogoutMutation)이 onSettled에서 홈으로 이동 처리함
      logout();
      logoutTimerRef.current = null; // 실행 후 레퍼런스 정리
    }, 1000); // 1초 후 로그아웃 실행
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
          // 모달 닫기
          unmount();

          // 회원탈퇴 API 호출
          deleteUser(undefined, {
            onSuccess: (response) => {
              console.log('회원탈퇴 성공:', response.message, response.data);

              // API 성공 시 토스트 표시
              notify({
                text: '탈퇴되었습니다',
                type: TOAST_TYPE.INFO,
                options: { autoClose: 2500 },
              });

              // 홈으로 이동
              navigate(ROUTES.HOME, { replace: true });
            },
            onError: (error) => {
              console.error('회원탈퇴 실패:', error);
              // 에러 시 에러 토스트 표시
              notify({
                text: '탈퇴에 실패했습니다. 다시 시도해주세요.',
                type: TOAST_TYPE.WARNING,
                options: { autoClose: 2500 },
              });
            },
          });
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
          <ul className={styles.buttonArea} aria-label="약관 및 정책 목록">
            <li className={styles.buttonItem}>
              <button
                type="button"
                className={styles.settingButton}
                onClick={handleServicePolicy}
                aria-label="서비스 이용 약관"
              >
                <span className={styles.buttonText}>서비스 이용 약관</span>
              </button>
            </li>
            <li className={styles.buttonItem}>
              <button
                type="button"
                className={styles.settingButton}
                onClick={handlePrivacyPolicy}
                aria-label="개인정보 처리방침"
              >
                <span className={styles.buttonText}>개인정보 처리방침</span>
              </button>
            </li>
          </ul>
        </section>

        {/* 계정 설정 섹션 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>계정 설정</h2>
          <ul className={styles.buttonArea} aria-label="계정 설정 목록">
            <li className={styles.buttonItem}>
              <button
                type="button"
                className={styles.settingButton}
                onClick={handleLogout}
                aria-label="로그아웃"
              >
                <span className={styles.buttonText}>로그아웃</span>
              </button>
            </li>
            <li className={styles.buttonItem}>
              <button
                type="button"
                className={styles.settingButton}
                onClick={handleWithdraw}
                aria-label="탈퇴하기"
              >
                <span className={styles.buttonText}>탈퇴하기</span>
              </button>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
};

export default SettingPage;
