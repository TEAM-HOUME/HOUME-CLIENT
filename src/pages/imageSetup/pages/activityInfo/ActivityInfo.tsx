import { useActivityOptionsQuery } from '@/pages/imageSetup/apis/activityInfo';
import { FUNNELHEADER_IMAGES } from '@/pages/imageSetup/constants/headerImages';
import { useActivityInfo } from '@/pages/imageSetup/hooks/useActivityInfo';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import Loading from '@/shared/components/loading/Loading';

import * as styles from './ActivityInfo.css';
import ButtonGroup from '../../components/buttonGroup/ButtonGroup';
import Caption from '../../components/caption/Caption';
import FunnelHeader from '../../components/header/FunnelHeader';
import HeadingText from '../../components/headingText/HeadingText';

import type { ImageSetupSteps } from '../../types/funnel/steps';

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
    getSelectedCodes,
    getRequiredFurnitureIds,
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
    <div className={styles.container}>
      <FunnelHeader
        title={`마지막 단계예요!`}
        detail={`집에서 주로 하는 활동과\n배치가 필요한 가구에 대해 알려주세요.`}
        currentStep={4}
        image={FUNNELHEADER_IMAGES[4]}
      />

      <div className={styles.contents}>
        <div>
          <HeadingText
            title="주요 활동"
            subtitle="선택한 활동에 최적화된 동선을 알려드려요."
          />
          <div className={styles.activityButton}>
            <ButtonGroup
              options={activityTypeOptions}
              selectedValues={
                formData.activityType ? [formData.activityType] : []
              }
              onSelectionChange={(values) =>
                setFormData((prev) => ({
                  ...prev,
                  activityType: values[0] || undefined,
                }))
              }
              selectionMode="single"
              buttonSize="large"
              layout="grid-2"
              errors={errors.activityType}
            />
          </div>
          <div className={styles.caption}>
            {/* <Caption code={} option={} /> */}
          </div>
        </div>

        <div className={styles.furnitures}>
          <HeadingText
            title="가구"
            subtitle="선택한 가구들로 이미지를 생성해드려요. (최대 6개)"
          />

          <ButtonGroup
            title="침대"
            titleSize="small"
            hasBorder={true}
            options={bedOptions}
            selectedValues={getSelectedCodes(bedOptions, formData.bedId)}
            onSelectionChange={(values) => {
              const selectedBed = bedOptions.find(
                (bed) => bed.code === values[0]
              );
              setFormData((prev) => ({
                ...prev,
                bedId: selectedBed?.id,
              }));
            }}
            selectionMode="single"
            buttonSize="xsmall"
            layout="grid-4"
            errors={errors.bedId}
          />

          <ButtonGroup
            title="주요가구"
            titleSize="small"
            options={selectiveOptions}
            selectedValues={getSelectedCodes(
              selectiveOptions,
              formData.selectiveIds
            )}
            onSelectionChange={(values) => {
              const selectedIds = values
                .map(
                  (code) =>
                    selectiveOptions.find((option) => option.code === code)?.id
                )
                .filter((id): id is number => id !== undefined);

              // 필수 가구는 항상 포함되도록 보장
              const requiredIds = getRequiredFurnitureIds();
              const finalIds = [...new Set([...requiredIds, ...selectedIds])]; // Set(): 주요 활동 변경 시 기존 선택과 새 필수 가구 중복 방지

              setFormData((prev) => ({ ...prev, selectiveIds: finalIds }));
            }}
            selectionMode="multiple"
            maxSelection={4}
            buttonSize="small"
            layout="grid-3"
            errors={errors.selectiveIds}
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
