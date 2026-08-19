// Step 3
import { useSelectMoodboardAnalytics } from '@pages/imageSetup/analytics/useSelectMoodboardAnalytics';
import { useMoodBoardQuery } from '@pages/imageSetup/apis/queries/useMoodBoardQuery';

import ActionButton from '@components/button/actionButton/ActionButton';
import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';
import TextHeading from '@components/textHeading/TextHeading';

import * as styles from './InteriorStyle.css';
import MoodBoard from './MoodBoard';

import type {
  CompletedInteriorStyle,
  ImageSetupSteps,
} from '../../types/funnel/steps';

interface InteriorStyleProps {
  context: ImageSetupSteps['InteriorStyle'];
  onNext: (data: CompletedInteriorStyle) => void;
}

const InteriorStyle = ({ context, onNext }: InteriorStyleProps) => {
  const {
    selectedImages,
    handleImageSelect,
    handleCtaButtonClick,
    isDataComplete,
  } = useSelectMoodboardAnalytics(context, onNext);

  const {
    data: moodBoardData,
    isPending,
    isError,
    refetch,
  } = useMoodBoardQuery();
  const images = moodBoardData?.moodBoardResponseList || [];

  return (
    <div className={styles.container}>
      <div className={styles.headingWrapper}>
        <TextHeading
          title="인테리어 취향을 알려주세요"
          caption={`인테리어 취향에 맞는 이미지를\n최대 5개까지 선택해주세요.`}
        />
      </div>

      {isError ? (
        <InlineError
          onRetry={refetch}
          message="무드보드를 불러올 수 없습니다"
        />
      ) : isPending ? (
        <Loading />
      ) : (
        <>
          <MoodBoard
            images={images}
            selectedImages={selectedImages}
            onImageSelect={handleImageSelect}
          />
          <div className={styles.buttonWrapper}>
            <ActionButton
              variant="solid"
              color="primary"
              size="2XL"
              visualDisabled={!isDataComplete}
              onClick={handleCtaButtonClick}
            >
              다음
            </ActionButton>
          </div>
        </>
      )}
    </div>
  );
};

export default InteriorStyle;
