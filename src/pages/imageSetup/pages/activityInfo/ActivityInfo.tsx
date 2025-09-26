import { useActivityOptionsQuery } from '@/pages/imageSetup/apis/activityInfo';
import { FUNNELHEADER_IMAGES } from '@/pages/imageSetup/constants/headerImages';
import { useActivityInfo } from '@/pages/imageSetup/hooks/activityInfo/useActivityInfo';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import Loading from '@/shared/components/loading/Loading';

import * as styles from './ActivityInfo.css';
import ButtonGroup from '../../components/buttonGroup/ButtonGroup';
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
    errors,
    handleSubmit,
    isFormCompleted,
    activitySelection,
    furnitureSelection,
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
  const bedOptions = activityOptionsData.categories[0];
  const sofaOptions = activityOptionsData.categories[1];
  const storageOptions = activityOptionsData.categories[2];
  const tableOptions = activityOptionsData.categories[3];
  const selectiveOptions = activityOptionsData.categories[4];

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
              selectedValues={activitySelection.selectedValues}
              onSelectionChange={activitySelection.handleActivityChange}
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
            title={bedOptions.nameKr}
            titleSize="small"
            hasBorder={true}
            options={bedOptions.furnitures}
            selectedValues={furnitureSelection.getCategorySelectedCodes(
              bedOptions
            )}
            onSelectionChange={(values) =>
              furnitureSelection.handleCategorySelection(bedOptions, values)
            }
            selectionMode="single"
            buttonSize="xsmall"
            layout="grid-4"
            errors={errors.selectiveIds}
          />

          <ButtonGroup
            title={sofaOptions.nameKr}
            titleSize="small"
            hasBorder={true}
            options={sofaOptions.furnitures}
            selectedValues={furnitureSelection.getCategorySelectedCodes(
              sofaOptions
            )}
            onSelectionChange={(values) =>
              furnitureSelection.handleCategorySelection(sofaOptions, values)
            }
            selectionMode="single"
            buttonSize="medium"
            layout="grid-2"
            errors={errors.selectiveIds}
          />

          <ButtonGroup
            title={storageOptions.nameKr}
            titleSize="small"
            options={storageOptions.furnitures}
            selectedValues={furnitureSelection.getCategorySelectedCodes(
              storageOptions
            )}
            onSelectionChange={(values) =>
              furnitureSelection.handleCategorySelection(storageOptions, values)
            }
            selectionMode="multiple"
            buttonSize="large"
            layout="grid-2"
            errors={errors.selectiveIds}
          />

          <ButtonGroup
            title={tableOptions.nameKr}
            titleSize="small"
            options={tableOptions.furnitures}
            selectedValues={furnitureSelection.getCategorySelectedCodes(
              tableOptions
            )}
            onSelectionChange={(values) =>
              furnitureSelection.handleCategorySelection(tableOptions, values)
            }
            selectionMode="multiple"
            buttonSize="small"
            layout="grid-3"
            errors={errors.selectiveIds}
          />

          <ButtonGroup
            title={selectiveOptions.nameKr}
            titleSize="small"
            options={selectiveOptions.furnitures}
            selectedValues={furnitureSelection.getCategorySelectedCodes(
              selectiveOptions
            )}
            onSelectionChange={(values) =>
              furnitureSelection.handleCategorySelection(
                selectiveOptions,
                values
              )
            }
            selectionMode="multiple"
            buttonSize="large"
            layout="grid-2"
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
