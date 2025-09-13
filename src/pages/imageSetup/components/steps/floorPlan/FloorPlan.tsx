// Step2FloorPlan.tsx (UI만 담당)
import { useEffect } from 'react';

import { FUNNELHEADER_IMAGES } from '@/pages/imageSetup/constants/headerImages';
import { useFloorPlan } from '@/pages/imageSetup/hooks/useFloorPlan';
import Loading from '@/shared/components/loading/Loading';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

import * as styles from './FloorPlan.css';
import FloorPlanList from './FloorPlanList';
import FunnelHeader from '../../header/FunnelHeader';

import type {
  CompletedFloorPlan,
  ImageSetupSteps,
} from '../../../types/funnel/steps';

interface FloorPlanProps {
  context: ImageSetupSteps['FloorPlan'];
  onNext: (data: CompletedFloorPlan) => void;
}

const FloorPlan = ({ context, onNext }: FloorPlanProps) => {
  const { handleError } = useErrorHandler('imageSetup');

  const {
    floorPlanList,
    isLoading,
    error,
    isError,
    selectedId,
    isMirror,
    selectedImage,
    handleImageSelect,
    handleFlipToggle,
    handleFloorPlanSelection,
  } = useFloorPlan(context, onNext);

  useEffect(() => {
    if (isError) {
      handleError(error || new Error('Floor plan data load failed'), 'api');
    }
  }, [isError, error, handleError]);

  /* 아래 if문들은 임시로 적용했습니다 */
  // 로딩 상태 처리
  if (isLoading) {
    return <Loading />;
  }

  // 데이터가 없는 경우
  if (!floorPlanList || floorPlanList.length === 0) {
    return (
      <div className={styles.container}>
        <FunnelHeader
          title={`유사한 집 구조를 선택해주세요`}
          detail={`템플릿을 선택하면 좌우반전을 할 수 있어요.`}
          currentStep={2}
          image={FUNNELHEADER_IMAGES[2]}
        />
        <div>사용 가능한 집 구조 템플릿이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <FunnelHeader
        title={`유사한 집 구조를 선택해주세요`}
        detail={`템플릿을 선택하면 좌우반전을 할 수 있어요.`}
        currentStep={2}
        image={FUNNELHEADER_IMAGES[2]}
        size="short"
      />

      <FloorPlanList
        floorPlanList={floorPlanList}
        selectedId={selectedId}
        isMirror={isMirror}
        selectedImage={selectedImage}
        onImageSelect={handleImageSelect}
        onFlipToggle={handleFlipToggle}
        onFloorPlanSelection={handleFloorPlanSelection}
      />
    </div>
  );
};

export default FloorPlan;
