import { useActivityOptionsQuery } from '@/pages/imageSetup/apis/activityInfo';
import { FUNNELHEADER_IMAGES } from '@/pages/imageSetup/constants/headerImages';
import { useActivityInfo } from '@/pages/imageSetup/hooks/activityInfo/useActivityInfo';
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
    isPending,
    error,
  } = useActivityOptionsQuery();

  console.log(activityOptionsData);

  const {
    handleSubmit,
    isFormCompleted,
    selectedActivityLabel,
    getRequiredFurnitureLabels,
    activitySelection,
    categorySelections,
  } = useActivityInfo(context, activityOptionsData);

  // 에러 처리
  if (error) {
    return <div>데이터를 불러올 수 없습니다.</div>;
  }

  // pending / 데이터가 없는 경우
  if (isPending || !activityOptionsData || !categorySelections) {
    return <Loading />;
  }

  const activityTypeOptions = activityOptionsData.activities;
  const bedOptions = activityOptionsData.categories[0];
  const sofaOptions = activityOptionsData.categories[1];
  const storageOptions = activityOptionsData.categories[2];
  const tableOptions = activityOptionsData.categories[3];
  const selectiveOptions = activityOptionsData.categories[4];

  // 선택된 가구 총 개수 계산
  const totalSelectedFurniture =
    categorySelections.bed.selectedValues.length +
    categorySelections.sofa.selectedValues.length +
    categorySelections.storage.selectedValues.length +
    categorySelections.table.selectedValues.length +
    categorySelections.selective.selectedValues.length;

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
            <ButtonGroup<string>
              options={activityTypeOptions}
              selectedValues={activitySelection.selectedValues}
              onSelectionChange={activitySelection.handleActivityChange}
              keyExtractor={(option) => option.code}
              selectionMode="single"
              buttonSize="large"
              layout="grid-2"
            />
          </div>
          {selectedActivityLabel && (
            <div className={styles.caption}>
              <Caption
                code={selectedActivityLabel}
                option={getRequiredFurnitureLabels()}
              />
            </div>
          )}
        </div>

        <div className={styles.furnitures}>
          <HeadingText
            title="가구"
            subtitle={`선택한 가구들로 이미지를 생성해드려요. (${totalSelectedFurniture}/6)`}
          />
          <ButtonGroup<number>
            title={bedOptions.nameKr}
            titleSize="small"
            hasBorder={true}
            options={bedOptions.furnitures}
            selectedValues={categorySelections.bed.selectedValues}
            onSelectionChange={categorySelections.bed.handleChange}
            keyExtractor={(option) => option.id!}
            selectionMode="single"
            buttonSize="xsmall"
            layout="grid-4"
            buttonStatuses={categorySelections.bed.furnitureStatus}
          />

          <ButtonGroup<number>
            title={sofaOptions.nameKr}
            titleSize="small"
            hasBorder={true}
            options={sofaOptions.furnitures}
            selectedValues={categorySelections.sofa.selectedValues}
            onSelectionChange={categorySelections.sofa.handleChange}
            keyExtractor={(option) => option.id!}
            selectionMode="single"
            buttonSize="medium"
            layout="grid-2"
            buttonStatuses={categorySelections.sofa.furnitureStatus}
          />

          <ButtonGroup<number>
            title={storageOptions.nameKr}
            titleSize="small"
            options={storageOptions.furnitures}
            selectedValues={categorySelections.storage.selectedValues}
            onSelectionChange={categorySelections.storage.handleChange}
            keyExtractor={(option) => option.id!}
            selectionMode="multiple"
            buttonSize="large"
            layout="grid-2"
            buttonStatuses={categorySelections.storage.furnitureStatus}
          />

          <ButtonGroup<number>
            title={tableOptions.nameKr}
            titleSize="small"
            options={tableOptions.furnitures}
            selectedValues={categorySelections.table.selectedValues}
            onSelectionChange={categorySelections.table.handleChange}
            keyExtractor={(option) => option.id!}
            selectionMode="multiple"
            buttonSize="small"
            layout="grid-3"
            buttonStatuses={categorySelections.table.furnitureStatus}
          />

          <ButtonGroup<number>
            title={selectiveOptions.nameKr}
            titleSize="small"
            options={selectiveOptions.furnitures}
            selectedValues={categorySelections.selective.selectedValues}
            onSelectionChange={categorySelections.selective.handleChange}
            keyExtractor={(option) => option.id!}
            selectionMode="multiple"
            buttonSize="large"
            layout="grid-2"
            buttonStatuses={categorySelections.selective.furnitureStatus}
          />
        </div>

        <div>
          <CtaButton isActive={isFormCompleted} onClick={() => handleSubmit()}>
            이미지 생성하기
          </CtaButton>
        </div>
      </div>
    </div>
  );
};

export default ActivityInfo;
