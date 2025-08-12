// Step 1
import * as styles from '../StepCommon.css';
import OptionGroup from '../optionGroup/OptionGroup';
import {
  type CompletedHouseInfo,
  type HouseType,
  type ImageGenerateSteps,
  type AreaType,
  type RoomType,
  HOUSE_INFO_OPTIONS,
} from '../../../types/funnel';
import FunnelHeader from '../../header/FunnelHeader';
import { useHouseInfo } from '@/pages/onboarding/hooks/logics/useHouseInfo';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import { FUNNELHEADER_IMAGES } from '@/pages/onboarding/constants/headerImages';

interface HouseInfoProps {
  context: ImageGenerateSteps['HouseInfo'];
  onNext: (data: CompletedHouseInfo) => void;
}

const HouseInfo = ({ context, onNext }: HouseInfoProps) => {
  const { formData, setFormData, errors, handleSubmit, isFormCompleted } =
    useHouseInfo(context);

  const houseTypeOptions = Object.values(HOUSE_INFO_OPTIONS.HOUSING_TYPES);
  const roomTypeOptions = Object.values(HOUSE_INFO_OPTIONS.ROOM_TYPES);
  const areaTypeOptions = Object.values(HOUSE_INFO_OPTIONS.AREA_TYPES);

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
