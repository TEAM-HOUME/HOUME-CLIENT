import { useEffect } from 'react';

import { overlay } from 'overlay-kit';
import { useNavigate } from 'react-router-dom';

import {
  trackRoomTypeBtnBackClick,
  trackRoomTypeMdResetInfoView,
} from '@pages/imageSetup/analytics/roomTypeAnalytics';

import { ROUTES } from '@routes/paths';

import {
  trackResetInfoMdKeepClick,
  trackResetInfoMdQuitClick,
} from '@analytics/componentAnalytics';
import { SCREEN_NAME } from '@analytics/screenNames';

import TitleNavBar from '@components/navBar/TitleNavBar';
import Popup from '@components/popup/Popup';

import { FUNNEL_STEP_PARAM } from '@constants/funnel';

import { useExitBlocker } from '@hooks/useExitBlocker';

import * as styles from './FunnelLayout.css';
import { useFloorPlanStore } from '../../stores/useFloorPlanStore';

type FunnelStepKey = 'FloorPlanSelect' | 'InteriorStyle' | 'ActivityInfo';

// 퍼널 스텝 별 NavBar 타이틀 매핑
const NAVBAR_TITLE_BY_STEP: Record<FunnelStepKey, string> = {
  FloorPlanSelect: '공간 선택하기',
  InteriorStyle: '취향 선택하기',
  ActivityInfo: '가구 선택하기',
};

// step1에서 모달 없이 통과시켜야 하는 라우트
// - LOGIN: 미로그인 사용자가 도면 선택 시 로그인 게이트로 이동하는 케이스
// - GENERATE: 숏퍼널(경로2/4/5)에서 도면 선택 후 바로 이미지 생성으로 이동하는 케이스
const ALLOWED_NEXT_PATHS: string[] = [ROUTES.LOGIN, ROUTES.GENERATE];

interface RoomTypeResetInfoPopupProps {
  onStay: () => void;
  onExit: () => void;
}

const RoomTypeResetInfoPopup = ({
  onStay,
  onExit,
}: RoomTypeResetInfoPopupProps) => {
  useEffect(() => {
    trackRoomTypeMdResetInfoView();
  }, []);

  return (
    <Popup
      btnStyle="text"
      btnText="계속하기"
      weakBtnText="나가기"
      onClose={() => {
        trackResetInfoMdKeepClick();
        onStay();
      }}
      onConfirm={() => {
        trackResetInfoMdKeepClick();
        onStay();
      }}
      onCancel={onExit}
      content={
        <div className={styles.popupContent}>
          <h3 className={styles.popupTitle}>
            지금 나가면 선택한
            <br />
            정보가 모두 사라져요.
          </h3>
          <p className={styles.popupDetail}>
            거의 다왔어요! 공간을 선택하고
            <br />
            원하는 AI 이미지를 받아보세요.
          </p>
        </div>
      }
    />
  );
};

interface FunnelLayoutProps {
  children: React.ReactNode;
  currentStep: FunnelStepKey;
}

const FunnelLayout = ({ children, currentStep }: FunnelLayoutProps) => {
  const navigate = useNavigate();
  const isStep1 = currentStep === 'FloorPlanSelect';

  // step1에서만 이탈 가드 활성화
  // NavBar 버튼/브라우저 뒤로가기/모바일 뒤로가기 swipe 모두 useExitBlocker가 가로챔
  useExitBlocker({
    enabled: isStep1, // step1에서 이동할 때만 useBlocker 활성화
    shouldBlockNavigation: ({ currentLocation, nextLocation }) => {
      // 반환값이 true이면 navigation 막음, onBlocked 콜백 호출 (모달 표시)
      // 반환값이 false이면 그냥 통과 -> 라우팅 정상 진행

      // useBlocker가 넘겨주는 currentLocation, nextLocation은 React Router의 Location 객체
      // .pathname='/imageSetup', .search='?image-gen-funnel.step=...'

      // use-funnel에서 페이지 이동 조건:
      // 1-1. pathname 동일 (퍼널 내부 step 이동)
      const isSamePath = currentLocation.pathname === nextLocation.pathname;
      // 1-2. search에 funnel step param 포함 (퍼널 내부에서 다음 step으로 이동)
      const isFunnelStepNav = nextLocation.search.includes(FUNNEL_STEP_PARAM);
      // 1-1, 1-2 둘 다 만족하면 navigation 허용
      if (isSamePath && isFunnelStepNav) return false;

      // 2. 화이트리스트 라우트(LOGIN, GENERATE) -> navigation 허용
      // step1에서 로그인 리다이렉트 or 이미지 생성으로의 navigation은 허용
      if (ALLOWED_NEXT_PATHS.includes(nextLocation.pathname)) return false;

      // 그 외의 경우(step1에서 뒤로가기)에는 onBlocked 콜백 호출
      return true;
    },
    onBlocked: ({ proceed, reset }) => {
      // vaul Drawer의 modal=true가 이탈방지 Popup의 pointer-events를 차단하므로,
      // popup이 떠 있는 동안에는 시트들을 일시 close하고, 계속 입력 시 원상 복구
      // 선택/필터 상태는 useFloorPlanStore가 보존하므로 시트만 다시 열면 사용자 작업이 그대로 이어짐
      const { isFilterSheetOpen, isFloorPlanSheetOpen, isRecentSheetOpen } =
        useFloorPlanStore.getState();
      const sheetsSnapshot = {
        isFilterSheetOpen,
        isFloorPlanSheetOpen,
        isRecentSheetOpen,
      };
      useFloorPlanStore.getState().pauseSheets();

      // unmount: overlay-kit이 제공, 모달 컴포넌트 제거
      overlay.open(({ unmount }) => {
        // '계속하기' / backdrop 클릭 -> blocker의 'blocked' 상태 해제, 현재 step에 머무름
        const stay = () => {
          useFloorPlanStore.getState().restoreSheets(sheetsSnapshot);
          reset();
          unmount();
        };

        const exit = () => {
          trackResetInfoMdQuitClick(SCREEN_NAME.ROOM_TYPE);
          unmount();
          proceed();
        };

        return <RoomTypeResetInfoPopup onStay={stay} onExit={exit} />;
      });
    },
  });

  return (
    <div className={styles.wrapper}>
      <TitleNavBar
        title={NAVBAR_TITLE_BY_STEP[currentStep]}
        backLabel="이전"
        // 모든 step에서 동일하게 navigate(-1) 호출
        // - step1: useExitBlocker가 가로채서 이탈 모달 표시 (이미지 생성 플로우 진행 중 보호)
        // - step2/step3: 이전 step 복귀
        onBackClick={() => {
          if (isStep1) {
            trackRoomTypeBtnBackClick();
          }
          navigate(-1);
        }}
      />
      <div className={styles.content}>
        <div className={styles.contentInner}>{children}</div>
      </div>
    </div>
  );
};

export default FunnelLayout;
