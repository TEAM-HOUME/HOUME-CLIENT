import { useRef } from 'react';

import { overlay } from 'overlay-kit';
import { useNavigate } from 'react-router-dom';

import { useDeleteUserMutation } from '@pages/login/apis/mutations/useDeleteUserMutation';
import { useLogoutMutation } from '@pages/login/apis/mutations/useLogoutMutation';
import {
  logMyPageClickBtnLogout,
  logMyPageClickBtnSuccession,
  logMyPageClickSuccessionModalCancel,
  logMyPageClickSuccessionModalOut,
} from '@pages/mypage/utils/analytics';

import { ROUTES } from '@routes/paths';

import { TOAST_TYPE } from '@shared/types/toast';

import GeneralModal from '@components/overlay/modal/GeneralModal';
import { useToast } from '@components/toast/useToast';
import TitleNavBar from '@components/v2/navBar/TitleNavBar';

import TextButton from '@/shared/components/v2/btnText/TextButton';

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
    logMyPageClickBtnLogout();
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
    logMyPageClickBtnSuccession();
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
          logMyPageClickSuccessionModalOut();
          // 모달 닫기
          unmount();
          deleteUser();
        }}
        onConfirm={() => {
          logMyPageClickSuccessionModalCancel();
          unmount();
        }}
        onClose={unmount}
      />
    ));
  };

  return (
    <>
      <TitleNavBar
        title="설정"
        backLabel="이전"
        onBackClick={() => navigate(-1)}
      />
      <div className={styles.container}>
        {/* 프로필 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>프로필</h2>
          <ul aria-label="프로필 설정 목록">
            <li className={styles.buttonItem}>
              <TextButton
                color="primary"
                size="s"
                // onClick={() => navigate(ROUTES.PROFILE_EDIT)}
                aria-label="프로필 수정"
              >
                프로필 수정
              </TextButton>
            </li>
          </ul>
        </section>

        {/* 약관 및 정책 섹션 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>약관 및 정책</h2>
          <ul aria-label="약관 및 정책 목록">
            <li className={styles.buttonItem}>
              <TextButton
                color="primary"
                size="s"
                onClick={handleServicePolicy}
                aria-label="서비스 이용 약관"
              >
                서비스 이용 약관
              </TextButton>
            </li>
            <li className={styles.buttonItem}>
              <TextButton
                color="primary"
                size="s"
                onClick={handlePrivacyPolicy}
                aria-label="개인정보 처리방침"
              >
                개인정보 처리방침
              </TextButton>
            </li>
          </ul>
        </section>

        {/* 계정 설정 섹션 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>계정 설정</h2>
          <ul aria-label="계정 설정 목록">
            <li className={styles.buttonItem}>
              <TextButton
                color="primary"
                size="s"
                onClick={handleLogout}
                aria-label="로그아웃"
              >
                로그아웃
              </TextButton>
            </li>
            <li className={styles.buttonItem}>
              <TextButton
                color="primary"
                size="s"
                onClick={handleWithdraw}
                aria-label="계정탈퇴"
              >
                계정 탈퇴
              </TextButton>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
};

export default SettingPage;
