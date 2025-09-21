// Step 1
import { useHousingOptionsQuery } from '@/pages/imageSetup/apis/houseInfo';
import { FUNNELHEADER_IMAGES } from '@/pages/imageSetup/constants/headerImages';
import { useHouseInfo } from '@/pages/imageSetup/hooks/useHouseInfo';
import type {
  AreaType,
  CompletedHouseInfo,
  HouseType,
  RoomType,
} from '@/pages/imageSetup/types/funnel/houseInfo';
import type { ImageSetupSteps } from '@/pages/imageSetup/types/funnel/steps';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';

import * as styles from './HouseInfo.css';
import ButtonGroup from '../../components/buttonGroup/ButtonGroup';
import FunnelHeader from '../../components/header/FunnelHeader';

interface HouseInfoProps {
  context: ImageSetupSteps['HouseInfo'];
  onNext: (data: CompletedHouseInfo) => void;
}

const HouseInfo = ({ context, onNext }: HouseInfoProps) => {
  const { formData, setFormData, errors, handleSubmit, isFormCompleted } =
    useHouseInfo(context);

  const { data: housingOptions } = useHousingOptionsQuery();

  const houseTypeOptions = housingOptions?.houseTypes || [];
  const roomTypeOptions = housingOptions?.roomTypes || [];
  const areaTypeOptions = housingOptions?.areaTypes || [];

  return (
    <div className={styles.container}>
      <FunnelHeader
        title={`집 구조에 대해 알려주세요`}
        detail={`공간에 꼭 맞는 스타일링을 위해\n주거 정보를 입력해주세요.`}
        currentStep={1}
        image={FUNNELHEADER_IMAGES[1]}
      />

      <div className={styles.contents}>
        <ButtonGroup<HouseType>
          title="주거 형태"
          titleSize="large"
          options={houseTypeOptions}
          selectedValues={formData.houseType ? [formData.houseType] : []}
          onSelectionChange={(values) =>
            setFormData((prev) => ({
              ...prev,
              houseType: values[0] || undefined,
            }))
          }
          selectionMode="single"
          buttonSize="large"
          layout="grid-2"
          errors={errors.houseType}
        />

        <ButtonGroup<RoomType>
          title="구조"
          titleSize="large"
          options={roomTypeOptions}
          selectedValues={formData.roomType ? [formData.roomType] : []}
          onSelectionChange={(values) =>
            setFormData((prev) => ({
              ...prev,
              roomType: values[0] || undefined,
            }))
          }
          selectionMode="single"
          buttonSize="large"
          layout="grid-2"
          errors={errors.roomType}
        />

        <ButtonGroup<AreaType>
          title="평형"
          titleSize="large"
          options={areaTypeOptions}
          selectedValues={formData.areaType ? [formData.areaType] : []}
          onSelectionChange={(values) =>
            setFormData((prev) => ({
              ...prev,
              areaType: values[0] || undefined,
            }))
          }
          selectionMode="single"
          buttonSize="large"
          layout="grid-2"
          errors={errors.areaType}
        />

        <div>
          <CtaButton
            isActive={isFormCompleted}
            onClick={() => handleSubmit(onNext)}
          >
            집 구조 선택하기
          </CtaButton>
        </div>
      </div>
    </div>
  );
};

export default HouseInfo;
