// Step 4
import * as common from '../StepCommon.css';
import FunnelHeader from '../../header/FunnelHeader';
import { MAIN_ACTIVITY_OPTIONS } from '../../../types/funnel/options';
import OptionGroup from '../optionGroup/OptionGroup';
import MainTitle from '../title/Maintitle';
import SubOptionGroup from '../optionGroup/SubOptionGroup';
import MultiOptionGroup from '../optionGroup/MultiOptionGroup';
import type { ActivityTypes } from '../../../types/funnel/activityInfo';
import type { ImageSetupSteps } from '../../../types/funnel/steps';
import { useActivityInfo } from '@/pages/imageSetup/hooks/useActivityInfo';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import { FUNNELHEADER_IMAGES } from '@/pages/imageSetup/constants/headerImages';

interface ActivityInfoProps {
  context: ImageSetupSteps['ActivityInfo'];
}

const ActivityInfo = ({ context }: ActivityInfoProps) => {
  const {
    formData,
    setFormData,
    errors,
    handleSubmit,
    isFormCompleted,
    isRequiredFurniture,
    getCurrentActivityLabel,
    getRequiredFurnitureLabels,
  } = useActivityInfo(context);

  const primaryUsageOptions = Object.values(
    MAIN_ACTIVITY_OPTIONS.PRIMARY_USAGE
  );
  const bedTypeOptions = Object.values(MAIN_ACTIVITY_OPTIONS.BED_TYPE);
  const otherFurnituresOptions = Object.values(
    MAIN_ACTIVITY_OPTIONS.OTHER_FURNITURES
  );

  return (
    <div className={common.container}>
      <FunnelHeader
        title={`마지막 단계예요!`}
        detail={`집에서 주로 하는 활동과\n배치가 필요한 가구에 대해 알려주세요.`}
        currentStep={4}
        image={FUNNELHEADER_IMAGES[4]}
      />

      <div className={common.wrapper}>
        <OptionGroup<ActivityTypes>
          title="주요 활동"
          body="선택한 활동에 최적화된 동선을 알려드려요."
          options={primaryUsageOptions}
          selected={formData.primaryUsage}
          onButtonClick={(value) =>
            setFormData((prev) => ({
              ...prev,
              primaryUsage: value,
            }))
          }
          error={errors.primaryUsage}
        />

        <div className={common.subWrapper}>
          <MainTitle title="가구" body="선택한 가구가 이미지에 반영돼요." />

          <SubOptionGroup<string>
            subtitle="침대"
            options={bedTypeOptions}
            selected={formData.bedId}
            onButtonClick={(value) =>
              setFormData((prev) => ({
                ...prev,
                bedId: value as number,
              }))
            }
            useId={true}
            error={errors.bedTypeId}
          />

          <MultiOptionGroup<string>
            options={otherFurnituresOptions}
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
