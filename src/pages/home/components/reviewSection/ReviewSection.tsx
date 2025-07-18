import * as styles from './ReviewSection.css';
import { REVIEW_DATA } from '../../constants/reviewData';
import { AnimatedSection } from '../AnimatedSection';
import { CardReview } from '@/shared/components/cardReview/CardReview';

const ReviewSection = () => {
  return (
    <div className={styles.wrapper}>
      <section className={styles.container}>
        {REVIEW_DATA.map((review, index) => (
          <AnimatedSection
            key={review.id}
            animationType="slideInLeft"
            delay={index * 200}
            duration={800}
          >
            <CardReview
              title={review.title}
              body={review.body}
              username={review.username}
            />
          </AnimatedSection>
        ))}
      </section>
      <AnimatedSection animationType="fadeIn" delay={800} duration={600}>
        <div className={styles.footerContainer}>
          <p className={styles.copy}>&copy; 2025 HouMe Labs, Inc.</p>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default ReviewSection;
