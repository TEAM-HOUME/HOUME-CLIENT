// Step 1
import { useEffect, useRef } from 'react';

import { useHousingOptionsQuery } from '@/pages/imageSetup/apis/houseInfo';
import { FUNNELHEADER_IMAGES } from '@/pages/imageSetup/constants/headerImages';
import { useHouseInfo } from '@/pages/imageSetup/hooks/useHouseInfo';
import type { CompletedHouseInfo } from '@/pages/imageSetup/types/funnel/houseInfo';
import type { ImageSetupSteps } from '@/pages/imageSetup/types/funnel/steps';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';

import * as styles from './HouseInfo.css';
import ButtonGroup from '../../components/buttonGroup/ButtonGroup';
import FunnelHeader from '../../components/header/FunnelHeader';
import {
  logSelectHouseInfoClickBtnCTA,
  logSelectHouseInfoClickBtnCTAInactive,
  logSelectHouseInfoViewError,
} from '../../utils/analytics';

interface HouseInfoProps {
  context: ImageSetupSteps['HouseInfo'];
  onNext: (data: CompletedHouseInfo) => void;
}

const HouseInfo = ({ context, onNext }: HouseInfoProps) => {
  const {
    formData,
    setFormData,
    errors,
    handleSubmit,
    isFormCompleted,
    hasError,
  } = useHouseInfo(context);

  const { data: housingOptions } = useHousingOptionsQuery();

  const houseTypeOptions = housingOptions?.houseTypes || [];
  const roomTypeOptions = housingOptions?.roomTypes || [];
  const areaTypeOptions = housingOptions?.areaTypes || [];

  // 에러 상태 추적을 위한 ref
  const errorSentRef = useRef(false);

  // 에러가 표시될 때 이벤트 전송 (최초 1회)
  useEffect(() => {
    if (hasError && !errorSentRef.current) {
      logSelectHouseInfoViewError();
      errorSentRef.current = true;
    } else if (!hasError) {
      // 에러가 사라지면 ref 초기화 (다시 에러가 발생하면 이벤트 전송)
      errorSentRef.current = false;
    }
  }, [hasError]);

  // CTA 버튼 클릭 핸들러
  const handleCtaButtonClick = () => {
    if (isFormCompleted) {
      // 활성 상태 버튼 클릭
      logSelectHouseInfoClickBtnCTA();
      handleSubmit(onNext);
    } else {
      // 비활성 상태 버튼 클릭
      logSelectHouseInfoClickBtnCTAInactive();
    }
  };

  return (
    <div className={styles.container}>
      <FunnelHeader
        title={`집 구조에 대해 알려주세요`}
        detail={`공간에 꼭 맞는 스타일링을 위해\n주거 정보를 입력해주세요.`}
        currentStep={1}
        image={FUNNELHEADER_IMAGES[1]}
      />

      <div className={styles.contents}>
        <ButtonGroup
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

        <ButtonGroup
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

        <ButtonGroup
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
          <CtaButton isActive={isFormCompleted} onClick={handleCtaButtonClick}>
            집 구조 선택하기
          </CtaButton>
        </div>
      </div>
    </div>
  );
};

export default HouseInfo;
