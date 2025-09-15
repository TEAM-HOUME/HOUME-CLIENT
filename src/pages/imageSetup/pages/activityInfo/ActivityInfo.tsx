// Step 4
import { useActivityOptionsQuery } from '@/pages/imageSetup/apis/activityInfo';
import { FUNNELHEADER_IMAGES } from '@/pages/imageSetup/constants/headerImages';
import { useActivityInfo } from '@/pages/imageSetup/hooks/useActivityInfo';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import Loading from '@/shared/components/loading/Loading';

import FunnelHeader from '../../header/FunnelHeader';
import MultiOptionGroup from '../optionGroup/MultiOptionGroup';
import OptionGroup from '../optionGroup/OptionGroup';
import SubOptionGroup from '../optionGroup/SubOptionGroup';
import * as common from '../StepCommon.css';
import MainTitle from '../title/Maintitle';

import type { ActivityType } from '../../../types/funnel/activityInfo';
import type { ImageSetupSteps } from '../../../types/funnel/steps';

interface ActivityInfoProps {
  context: ImageSetupSteps['ActivityInfo'];
}

const ActivityInfo = ({ context }: ActivityInfoProps) => {
  const {
    data: activityOptionsData,
    isLoading,
    error,
  } = useActivityOptionsQuery();

  console.log(activityOptionsData);

  const {
    formData,
    setFormData,
    errors,
    handleSubmit,
    isFormCompleted,
    isRequiredFurniture,
    getCurrentActivityLabel,
    getRequiredFurnitureLabels,
  } = useActivityInfo(context, activityOptionsData);

  // 에러 처리
  if (error) {
    return <div>데이터를 불러올 수 없습니다.</div>;
  }

  // 로딩 중이거나 데이터가 없는 경우
  if (isLoading || !activityOptionsData) {
    return <Loading />;
  }

  const activityTypeOptions = activityOptionsData.activities;
  const bedOptions = activityOptionsData.beds.items;
  const selectiveOptions = activityOptionsData.selectives.items;

  return (
    <div className={common.container}>
      <FunnelHeader
        title={`마지막 단계예요!`}
        detail={`집에서 주로 하는 활동과\n배치가 필요한 가구에 대해 알려주세요.`}
        currentStep={4}
        image={FUNNELHEADER_IMAGES[4]}
      />

      <div className={common.wrapper}>
        <OptionGroup<ActivityType>
          title="주요 활동"
          body="선택한 활동에 최적화된 동선을 알려드려요."
          options={activityTypeOptions}
          selected={formData.activityType}
          onButtonClick={(value) =>
            setFormData((prev) => ({
              ...prev,
              activityType: value,
            }))
          }
          error={errors.activityType}
        />

        <div className={common.subWrapper}>
          <MainTitle title="가구" body="선택한 가구가 이미지에 반영돼요." />

          <SubOptionGroup<string>
            subtitle="침대"
            options={bedOptions}
            selected={formData.bedId}
            onButtonClick={(value) =>
              setFormData((prev) => ({
                ...prev,
                bedId: value as number,
              }))
            }
            useId={true}
            error={errors.bedId}
          />

          <MultiOptionGroup<string>
            options={selectiveOptions}
            selected={formData.selectiveIds}
            selectedCount={formData.selectiveIds?.length || 0}
            onButtonClick={(value) =>
              setFormData((prev) => ({
                ...prev,
                selectiveIds: value as number[],
              }))
            }
            maxSelect={4}
            isAlertPresented={true}
            error={errors.selectiveIds}
            isRequiredFurniture={isRequiredFurniture}
            currentActivityLabel={getCurrentActivityLabel()}
            requiredFurnitureLabels={getRequiredFurnitureLabels()}
            useId={true}
          />
        </div>

        <div>
          <CtaButton
            isActive={isFormCompleted}
            onClick={() => handleSubmit(() => {})}
          >
            이미지 생성하기
          </CtaButton>
        </div>
      </div>
    </div>
  );
};

export default ActivityInfo;
