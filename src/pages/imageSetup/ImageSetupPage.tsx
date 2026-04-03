import { useEffect, useState } from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { getNextFunnelStep, useImageFlowStore } from '@store/useImageFlowStore';
import { useUserStore } from '@store/useUserStore';

import FeatureErrorFallback from '@components/errorFallback/FeatureErrorFallback';

import { getLoginRedirect, setLoginRedirect } from '@utils/loginRedirect';

import FunnelLayout from './components/layout/FunnelLayout';
import { useImageSetup } from './hooks/useImageSetup';
import ActivityInfo from './steps/activityInfo/ActivityInfo';
import InteriorStyle from './steps/interiorStyle/InteriorStyle';
import { useFunnelStore } from './stores/useFunnelStore';
import FloorPlanSelectStep from './v2/steps/floorPlanSelect/FloorPlanSelectStep';
import { useFloorPlanStore } from './v2/stores/useFloorPlanStore';

import type {
  CompletedFloorPlanSelect,
  CompletedInteriorStyle,
} from './types/funnel/steps';

type StepType = 'FloorPlanSelect' | 'InteriorStyle' | 'ActivityInfo';

interface StepWrapperProps {
  step: StepType;
  onMount: (step: StepType) => void;
  children: React.ReactNode;
}

const StepWrapper = ({ step, onMount, children }: StepWrapperProps) => {
  useEffect(() => {
    onMount(step);
  }, [step, onMount]);

  return <>{children}</>;
};

const ImageSetupPage = () => {
  const funnel = useImageSetup();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<StepType>('FloorPlanSelect');

  // 퍼널 전체가 unmount될 때 (퍼널 벗어날 때) 데이터 초기화
  useEffect(() => {
    // cleanup
    return () => {
      const loginRedirect = getLoginRedirect();
      // loginRedirect는 로그인 게이트 시작 시 setLoginRedirect()로 저장, 완료 시 consumeLoginRedirect()로 삭제됨
      // 로그인 후 복귀 시 도면 선택값을 복원해야하므로, 로그인 게이트 진행 중(loginRedirect 존재하는 경우)에는 reset 스킵
      if (!loginRedirect) {
        // 로그인 게이트로 퍼널을 탈출하는게 아닌 경우에는 퍼널 store, 도면 store값 초기화
        useFunnelStore.getState().reset();
        useFloorPlanStore.getState().reset();
        // 의도적 퍼널 이탈 혹은 퍼널 완료 시 퍼널을 탈출함. 이때 useImageFlowStore 전체를 reset하면
        // 1. Result 페이지에서 추천형/목록형 분기에 resultType을 사용할 수 없고,
        // 2. Loading 페이지에서 이미지 생성 API 호출 시 preset을 사용할 수 없다
        // 따라서 entryRoute만 null로 초기화, 나머지 ImageFlow 값들은 유지
        // +) 퍼널 진입 시 모든 진입점에서 setFlow()로 entryRoute, resultType, preset을 초기화하므로 문제 X
        useImageFlowStore.setState({ entryRoute: null });
      }
    };
  }, []);

  // entryRoute가 존재하지 않으면(ex: URL로 직접 접근) 홈으로 리다이렉트하도록 예외처리
  // entryRoute는 sessionStorage persist로 저장되므로 브라우저 새로고침, OAuth 복귀 시에는 유지됨 -> 예외처리 필요 X
  // sessionStorage 수동 삭제 <- 이까지는 일반적인 사용자 플로우 X
  // => URL로 직접 접근하는 경우에 대한 예외처리만 적용하면 될 듯함
  const entryRoute = useImageFlowStore.getState().entryRoute;
  if (!entryRoute) {
    // Navigate: 렌더되면 해당 경로로 이동시키는 React Router 컴포넌트
    // useEffect + navigate()보다 더 선언적, React스러움
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <FunnelLayout currentStep={currentStep}>
      <ErrorBoundary
        FallbackComponent={FeatureErrorFallback}
        onReset={() => {
          useFunnelStore.getState().reset();
        }}
      >
        <funnel.Render
          FloorPlanSelect={funnel.Render.with({
            events: {
              selectedFloorPlan: (
                data: CompletedFloorPlanSelect,
                { history }
              ) => {
                const entryRoute = useImageFlowStore.getState().entryRoute;
                if (!entryRoute) return;
                const nextStep = getNextFunnelStep(entryRoute);

                if (nextStep === 'INTERIOR_STYLE') {
                  // 풀퍼널 (경로 1, 3): 로그인 체크 후 다음 스텝으로 이동
                  const isLoggedIn = !!useUserStore.getState().accessToken;

                  if (!isLoggedIn) {
                    // 미로그인: 도면 선택값은 useFunnelStore persist로 유지됨
                    setLoginRedirect(ROUTES.IMAGE_SETUP);
                    navigate(ROUTES.LOGIN);
                    return;
                  }

                  // 퍼널 내에서 다음 스텝(InteriorStyle)으로 이동
                  history.push('InteriorStyle', data);
                } else {
                  // 숏퍼널(경로 2, 4, 5): 퍼널 탈출 → 이미지 생성
                  // 숏퍼널은 마지막 스텝이 FloorPlanSelect → 퍼널 탈출 시점에 데이터 조합 및 API 요청. 이 위치에서 처리하는게 자연스러움
                  // TODO: 경로별 이미지 생성 API 확정 후 요청 데이터 재설계 필요
                  const generateRequest = {
                    houseId: 0,
                    equilibrium: '',
                    floorPlan: data.floorPlan,
                    moodBoardIds: [],
                    activity: '',
                    selectiveIds: [],
                  };
                  sessionStorage.setItem(
                    'generate_image_request',
                    JSON.stringify(generateRequest)
                  );
                  navigate(ROUTES.GENERATE);
                }
              },
            },
            render({ dispatch, context }) {
              return (
                <StepWrapper step="FloorPlanSelect" onMount={setCurrentStep}>
                  <FloorPlanSelectStep
                    context={context}
                    onNext={(data) => dispatch('selectedFloorPlan', data)}
                  />
                </StepWrapper>
              );
            },
          })}
          InteriorStyle={funnel.Render.with({
            events: {
              selectInteriorStyle: (
                data: CompletedInteriorStyle,
                { history }
              ) => {
                history.push('ActivityInfo', data);
              },
            },
            render({ dispatch, context }) {
              return (
                <StepWrapper step="InteriorStyle" onMount={setCurrentStep}>
                  <InteriorStyle
                    context={context}
                    onNext={(data) => dispatch('selectInteriorStyle', data)}
                  />
                </StepWrapper>
              );
            },
          })}
          ActivityInfo={funnel.Render.with({
            events: {},
            render({ context }) {
              return (
                <StepWrapper step="ActivityInfo" onMount={setCurrentStep}>
                  <ActivityInfo context={context} />
                </StepWrapper>
              );
            },
          })}
        />
      </ErrorBoundary>
    </FunnelLayout>
  );
};

export default ImageSetupPage;
