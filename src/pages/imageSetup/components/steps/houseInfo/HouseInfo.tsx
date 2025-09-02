// Step 1
import * as styles from '../StepCommon.css';
import OptionGroup from '../optionGroup/OptionGroup';
import FunnelHeader from '../../header/FunnelHeader';
import type { ImageSetupSteps } from '../../../types/funnel/steps';
import type {
  CompletedHouseInfo,
  HouseType,
  RoomType,
  AreaType,
} from '../../../types/funnel/houseInfo';
import { useHouseInfo } from '@/pages/imageSetup/hooks/useHouseInfo';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import { FUNNELHEADER_IMAGES } from '@/pages/imageSetup/constants/headerImages';
import { useHousingOptionsQuery } from '@/pages/imageSetup/apis/houseInfoApi';

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

      <div className={styles.wrapper}>
        <OptionGroup<HouseType>
          title="주거 형태"
          options={houseTypeOptions}
          selected={formData.houseType}
          onButtonClick={(value) =>
            setFormData((prev) => ({ ...prev, houseType: value }))
          }
          error={errors.houseType}
        />

        <OptionGroup<RoomType>
          title="구조"
          options={roomTypeOptions}
          selected={formData.roomType}
          onButtonClick={(value) =>
            setFormData((prev) => ({ ...prev, roomType: value }))
          }
          error={errors.roomType}
        />

        <OptionGroup<AreaType>
          title="평형"
          options={areaTypeOptions}
          selected={formData.areaType}
          onButtonClick={(value) =>
            setFormData((prev) => ({ ...prev, areaType: value }))
          }
          error={errors.areaType}
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
