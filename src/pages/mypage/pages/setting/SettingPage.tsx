import { useEffect } from 'react';

import { overlay } from 'overlay-kit';
import { useNavigate } from 'react-router-dom';

import {
  getSettingPageViewParams,
  trackSettingLogoutClick,
  trackSettingSuccessionClick,
  trackSettingSuccessionModalView,
} from '@pages/mypage/analytics/settingAnalytics';
import { useDeleteUserMutation } from '@pages/mypage/apis/mutations/useDeleteUserMutation';
import { useLogoutMutation } from '@pages/mypage/apis/mutations/useLogoutMutation';

import { ROUTES } from '@routes/paths';

import {
  trackSuccessionMdByeClick,
  trackSuccessionMdCancelClick,
} from '@analytics/componentAnalytics';
import { GA_EVENTS } from '@analytics/events';
import { useAnalyticsPageView } from '@analytics/hooks/useAnalyticsPageView';
import { SCREEN_NAME } from '@analytics/screenNames';

import TextButton from '@components/btnText/TextButton';
import TitleNavBar from '@components/navBar/TitleNavBar';
import Popup from '@components/popup/Popup';

import * as styles from './SettingPage.css';

interface SuccessionPopupProps {
  onCancel: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

const SuccessionPopup = ({
  onCancel,
  onConfirm,
  onClose,
}: SuccessionPopupProps) => {
  useEffect(() => {
    trackSettingSuccessionModalView();
  }, []);

  return (
    <Popup
      btnStyle="text"
      topIconName="WarningFillDanger"
      btnText="취소하기"
      weakBtnText="탈퇴하기"
      onConfirm={onConfirm}
      onCancel={onCancel}
      onClose={onClose}
      content={
        <div className={styles.popupContent}>
          <h3 className={styles.popupTitle}>하우미 탈퇴 전 확인하세요</h3>
          <p className={styles.popupDetail}>
            탈퇴 시 생성했던 이미지와 함께
            <br />
            모든 정보가 삭제되며, 복구가 불가능해요.
          </p>
        </div>
      }
    />
  );
};

const SettingPage = () => {
  const navigate = useNavigate();
  const { mutate: logout } = useLogoutMutation();
  const { mutate: deleteUser } = useDeleteUserMutation();

  useAnalyticsPageView(
    GA_EVENTS.setting.PAGE_VIEW,
    SCREEN_NAME.SETTING,
    getSettingPageViewParams()
  );

  const handleServicePolicy = () => {
    navigate(ROUTES.SETTING_SERVICE);
  };

  const handlePrivacyPolicy = () => {
    navigate(ROUTES.SETTING_PRIVACY);
  };

  const handleProfileEdit = () => {
    navigate(ROUTES.SETTING_PROFILE_EDIT);
  };

  const handleLogout = () => {
    trackSettingLogoutClick();

    // 보호 라우트 리다이렉트 경쟁을 피하기 위해 먼저 홈으로 이동
    navigate(ROUTES.HOME, { replace: true });

    // 홈 이동이 커밋된 뒤 인증을 해제해야 보호 라우트 가드와 경쟁하지 않는다
    // (navigate 직후 페이지가 언마운트되므로 중복 클릭 방어는 불필요)
    window.setTimeout(() => {
      logout();
    }, 1000);
  };

  const handleWithdraw = () => {
    trackSettingSuccessionClick();

    overlay.open(({ unmount }) => (
      <SuccessionPopup
        onConfirm={() => {
          trackSuccessionMdCancelClick();
          unmount();
        }}
        onCancel={() => {
          trackSuccessionMdByeClick();
          unmount();
          deleteUser();
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
                onClick={handleProfileEdit}
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
