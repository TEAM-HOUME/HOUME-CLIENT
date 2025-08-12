// Step 3
import MoodBoard from './MoodBoard';
import * as styles from './InteriorStyle.css';
import FunnelHeader from '../../header/FunnelHeader';
import type {
  CompletedInteriorStyle,
  ImageSetupSteps,
} from '../../../types/funnel';
import CtaButton from '@/shared/components/button/ctaButton/CtaButton';
import { useInteriorStyle } from '@/pages/imageSetup/hooks/logics/useInteriorStyle';
import { FUNNELHEADER_IMAGES } from '@/pages/imageSetup/constants/headerImages';

interface InteriorStyleProps {
  context: ImageSetupSteps['InteriorStyle'];
  onNext: (data: CompletedInteriorStyle) => void;
}

const InteriorStyle = ({ context, onNext }: InteriorStyleProps) => {
  const { selectedImages, handleImageSelect, handleNext, isDataComplete } =
    useInteriorStyle(context, onNext);

  return (
    <div className={styles.container}>
      <FunnelHeader
        title={`인테리어 취향을 알려주세요`}
        detail={`인테리어 취향에 맞는 이미지를\n최대 5개까지 선택해주세요.`}
        currentStep={3}
        image={FUNNELHEADER_IMAGES[3]}
      />

      <MoodBoard
        selectedImages={selectedImages}
        onImageSelect={handleImageSelect}
      />
      <div className={styles.buttonWrapper}>
        <CtaButton isActive={isDataComplete} onClick={handleNext}>
          집 구조 선택하기
        </CtaButton>
      </div>
    </div>
  );
};

export default InteriorStyle;
