// Step 1
import * as styles from '../StepCommon.css';
import OptionGroup from '../optionGroup/OptionGroup';
import {
  type CompletedHouseInfo,
  type ImageSetupSteps,
} from '../../../types/funnel';
import FunnelHeader from '../../header/FunnelHeader';
import type {
  HouseTypeCode,
  RoomTypeCode,
  AreaTypeCode,
} from '../../../types/apis/houseInfo';
import { useHousingOptionsQuery } from '@/pages/imageSetup/api/houseInfoApi';
import { useHouseInfo } from '@/pages/imageSetup/hooks/useHouseInfo';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import { FUNNELHEADER_IMAGES } from '@/pages/imageSetup/constants/headerImages';

interface HouseInfoProps {
  context: ImageSetupSteps['HouseInfo'];
  onNext: (data: CompletedHouseInfo) => void;
}

const HouseInfo = ({ context, onNext }: HouseInfoProps) => {
  const { formData, setFormData, errors, handleSubmit, isFormCompleted } =
    useHouseInfo(context);

  // 서버에서 주거 옵션 데이터 가져오기 (캐시에서 즉시 사용)
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
        <OptionGroup<HouseTypeCode>
          title="주거 형태"
          options={houseTypeOptions}
          selected={formData.houseType}
          onButtonClick={(value) =>
            setFormData((prev) => ({ ...prev, houseType: value }))
          }
          error={errors.houseType}
        />

        <OptionGroup<RoomTypeCode>
          title="구조"
          options={roomTypeOptions}
          selected={formData.roomType}
          onButtonClick={(value) =>
            setFormData((prev) => ({ ...prev, roomType: value }))
          }
          error={errors.roomType}
        />

        <OptionGroup<AreaTypeCode>
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
