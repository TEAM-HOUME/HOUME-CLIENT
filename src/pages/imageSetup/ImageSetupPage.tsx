import { useEffect, useState } from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import {
  entryRouteToFlowRoute,
  FLOW_CONFIG,
} from '@store/imageFlow/flowConfig';
import {
  consumeEntryRouteHold,
  holdEntryRoute,
  useImageFlowStore,
} from '@store/useImageFlowStore';

import { mapEntryRouteToLoginEntry } from '@shared/analytics/utils/loginEntryRoute';

import FeatureErrorFallback from '@components/errorFallback/FeatureErrorFallback';

import { useCreditGuard } from '@hooks/useCreditGuard';
import { useLoginGate } from '@hooks/useLoginGate';

import { getLoginRedirect } from '@utils/loginRedirect';

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
        // useFloorPlanStore(도면 시트 UI 상태) + entryRoute(가드용)만 cleanup에서 정리
        // useImageFlowStore의 preset/resultType은 LoadingPage/ResultPage에서 사용하므로 유지
        // /generate 정상 이동 시 entryRoute도 유지 (GA image_entry_route)
        useFloorPlanStore.getState().reset();
        if (!consumeEntryRouteHold()) {
          useImageFlowStore.setState({ entryRoute: null });
        }
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
              selectedFloorPlan: async (
                data: CompletedFloorPlanSelect,
                { history }
              ) => {
                const entryRoute = useImageFlowStore.getState().entryRoute;
                if (!entryRoute) return;
                const nextStep =
                  FLOW_CONFIG[entryRouteToFlowRoute(entryRoute)].afterFloorPlan;

                if (nextStep === 'INTERIOR_STYLE') {
                  // 풀퍼널 (경로 1, 3): 로그인 게이트 통과 후 다음 스텝(InteriorStyle)으로 이동
                  // 미로그인 시 도면 선택값은 useFunnelStore persist로 유지됨
                  requireLogin(
                    () => history.push('InteriorStyle', data),
                    mapEntryRouteToLoginEntry(entryRoute)
                  );
                } else {
                  // 숏퍼널(경로 2, 4, 5): FloorPlanSelect가 마지막 스텝 → 바로 이미지 생성으로 이동
                  // payload는 LoadingPage가 useImageFlowStore.preset + useFunnelStore.floorPlan으로 조립
                  const hasCredit = await checkCredit();
                  if (!hasCredit) return;

                  holdEntryRoute();
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
