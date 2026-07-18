import { useEffect, useState } from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { FLOW_CONFIG } from '@store/imageFlow/flowConfig';
import { useFunnelStore } from '@store/useFunnelStore';
import { useImageFlowStore } from '@store/useImageFlowStore';

import { mapEntryRouteToLoginEntry } from '@shared/analytics/utils/loginEntryRoute';

import FeatureErrorFallback from '@components/errorFallback/FeatureErrorFallback';

import { useCreditGuard } from '@hooks/useCreditGuard';
import { useLoginGate } from '@hooks/useLoginGate';

import { getLoginRedirect } from '@utils/loginRedirect';

import FunnelLayout from './components/layout/FunnelLayout';
import { useImageSetup } from './hooks/useImageSetup';
import ActivityInfo from './steps/activityInfo/ActivityInfo';
import InteriorStyle from './steps/interiorStyle/InteriorStyle';
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
  const { requireLogin } = useLoginGate();
  const { checkCredit } = useCreditGuard(1);
  const [currentStep, setCurrentStep] = useState<StepType>('FloorPlanSelect');

  // 퍼널 데이터 정리 방식
  // - mount: useFunnelStore.reset() — 새 퍼널 진입이므로 이전 데이터 정리
  // - cleanup: useFunnelStore.reset()은 호출하지 않음 — LoadingPage가 useFunnelStore 데이터로 이미지 생성 API payload를 조립하므로 보존 필요
  // - loginRedirect 진행 중에는 reset 스킵 (로그인 게이트 복귀 시 사용자 입력 복원)
  useEffect(() => {
    const loginRedirect = getLoginRedirect();
    if (!loginRedirect) {
      useFunnelStore.getState().reset();
    }

    return () => {
      const loginRedirect = getLoginRedirect();
      if (!loginRedirect) {
        // 도면 시트 UI 상태는 초기화하고, 플로우는 "퍼널을 나감"으로만 표시한다(leaveFunnel).
        // route는 남겨야 LoadingPage/ResultPage와 GA가 계속 쓸 수 있음.
        useFloorPlanStore.getState().reset();
        useImageFlowStore.getState().leaveFunnel();
      }
    };
  }, []);

  // 퍼널 진행 중일 때만(phase==='funnel') 이 페이지를 연다.
  // 그 외(URL로 바로 들어옴, 이미 퍼널을 나감)는 홈으로 보냄.
  // 새로고침·로그인 복귀 때는 flow가 sessionStorage에 남아 phase='funnel'이라 그대로 통과된다.
  const flow = useImageFlowStore.getState().flow;
  if (flow?.phase !== 'funnel') {
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
              selectedFloorPlan: async (
                data: CompletedFloorPlanSelect,
                { history }
              ) => {
                const flow = useImageFlowStore.getState().flow;
                if (!flow) return;
                const nextStep = FLOW_CONFIG[flow.route].afterFloorPlan;

                if (nextStep === 'INTERIOR_STYLE') {
                  // 풀퍼널 (경로 1, 3): 로그인 게이트 통과 후 다음 스텝(InteriorStyle)으로 이동
                  // 미로그인 시 도면 선택값은 useFunnelStore persist로 유지됨
                  requireLogin(
                    () => history.push('InteriorStyle', data),
                    mapEntryRouteToLoginEntry(flow.route)
                  );
                } else {
                  // 숏퍼널(경로 2, 4, 5): FloorPlanSelect가 마지막 스텝 → 바로 이미지 생성으로 이동
                  // payload는 LoadingPage가 flow + useFunnelStore.floorPlan으로 조립
                  const hasCredit = await checkCredit();
                  if (!hasCredit) return;

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
