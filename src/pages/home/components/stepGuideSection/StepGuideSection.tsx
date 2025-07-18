import AiLandingImage from '@assets/images/landingAIImage.png';
import InfoLandingImage from '@assets/images/landingInfoImage.png';
import LandingImage3_1 from '@assets/images/landingImage3-1.png';
import LandingImage3_2 from '@assets/images/landingImage3-2.png';
import LandingImage3_3 from '@assets/images/landingImage3-3.png';
import LandingImage4 from '@assets/images/landingImage4.png';
import * as styles from './StepGuideSection.css.ts';
import { AnimatedSection } from '../AnimatedSection.tsx';
import TitleStep from '@/shared/components/titleStep/TitleStep';

const StepGuideSection = () => {
  return (
    <section className={styles.wrapper}>
      {/* 첫 번째 안내 이미지 - 애니메이션 없이 처음부터 표시 */}
      <div className={styles.landingImage}>
        <img
          src={InfoLandingImage}
          alt="안내 랜딩 이미지"
          className={styles.landingImageImg}
        />
        <div className={styles.headingText}>
          <p>
            간단하게 정보를 입력하고 <br />
            나에게 딱 맞는 이미지를 받아보세요
          </p>
        </div>
      </div>

      {/* Step 1 */}
      <AnimatedSection animationType="fadeInUp" delay={0} duration={1000}>
        <div>
          <TitleStep stepNumber={1} title="우리 집과 유사한 구조를 선택하기" />
          <img
            src={LandingImage3_1}
            alt="집 구조 선택 이미지"
            className={`${styles.stepLandImage} ${styles.imageGap}`}
          />
        </div>
      </AnimatedSection>

      {/* Step 2 */}
      <AnimatedSection animationType="slideInRight" delay={0} duration={1000}>
        <div>
          <TitleStep
            stepNumber={2}
            title="내 취향인 인테리어 이미지 선택하기"
          />
          <img
            src={LandingImage3_2}
            alt="인테리어 이미지 선택"
            className={`${styles.stepLandImage} ${styles.imageGap}`}
          />
        </div>
      </AnimatedSection>

      {/* Step 3 */}
      <AnimatedSection animationType="slideInLeft" delay={0} duration={1000}>
        <div>
          <TitleStep
            stepNumber={3}
            title="집에서 하는 주요 활동과 가구 선택하기"
          />
          <img
            src={LandingImage3_3}
            alt="가구 선택 이미지"
            className={`${styles.stepLandImage} ${styles.imageGap}`}
          />
        </div>
      </AnimatedSection>

      {/* AI 결과 안내 이미지 */}
      <AnimatedSection animationType="scaleUp" delay={0} duration={1200}>
        <div className={styles.landingImage}>
          <img
            src={AiLandingImage}
            alt="ai 랜딩 이미지"
            className={styles.landingImageImg}
          />
          <div className={styles.headingText}>
            <p>
              AI 이미지로 나와 집에 딱 맞는 <br />
              스타일링 이미지를 받아보세요
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* 결과 이미지 */}
      <AnimatedSection animationType="fadeIn" delay={200} duration={1000}>
        <div className={styles.resultImageContainer}>
        <img
          src={LandingImage4}
          alt="결과 이미지"
          className={styles.resultLandImage}
        />
      </div>
      </AnimatedSection>
    </section>
  );
};

export default StepGuideSection;
