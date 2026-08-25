import Icon from '@components/icon/Icon';

import * as styles from './CompareResultSkeleton.css';
import * as outputStyles from '../linkOutput/OutputLink.css';

const SKELETON_CARD_COUNT = 4;
const SKELETON_CHIP_COUNT = 3;

const OutputLinkSkeleton = () => (
  <section
    className={outputStyles.container}
    aria-label="검색한 상품 불러오는 중"
  >
    <div className={outputStyles.contentButton}>
      <div className={outputStyles.titleRow}>
        <Icon name="Link" size="24" decorative />
        <h2 className={outputStyles.title}>검색한 상품</h2>
      </div>

      <div className={outputStyles.productCard} aria-hidden>
        <div
          className={`${outputStyles.imgSection} ${styles.outputImagePlaceholder}`}
        />
        <div className={outputStyles.infoSection}>
          <div className={styles.outputBrandPlaceholder} />
          <div className={styles.outputNamePlaceholder} />
          <div className={styles.outputPricePlaceholder} />
        </div>
      </div>
    </div>

    <div className={outputStyles.searchButton} aria-hidden>
      <span className={outputStyles.searchButtonContent}>
        <Icon name="Search" size="16" decorative />
        <span className={outputStyles.searchButtonText}>
          새로운 링크 검색하기
        </span>
      </span>
    </div>
  </section>
);

const ProductCardSkeleton = () => (
  <div className={styles.productCard} aria-hidden>
    <div className={styles.productImage} />
    <div className={styles.productInfo}>
      <div className={styles.productTextPlaceholders}>
        <div className={styles.productBrandPlaceholder} />
        <div className={styles.productNamePlaceholder} />
        <div className={styles.productPricePlaceholder} />
      </div>
    </div>
  </div>
);

const CompareResultSkeleton = () => {
  return (
    <div
      className={styles.container}
      aria-busy="true"
      aria-label="비슷한 상품을 불러오는 중"
    >
      <OutputLinkSkeleton />

      <section className={styles.similarSection}>
        <div className={styles.similarTitleRow}>
          <Icon name="DoubleStarFillBlack" size="20" decorative />
          <h2 className={styles.similarTitle}>비슷한 상품</h2>
        </div>

        <div className={styles.controls} aria-hidden>
          <div className={styles.chipList}>
            {Array.from({ length: SKELETON_CHIP_COUNT }, (_, index) => (
              <span className={styles.chip} key={index} />
            ))}
          </div>
          <div className={styles.sortLabel}>
            <span>추천순</span>
            <Icon name="ChevronDown" size="12" decorative />
          </div>
        </div>

        <div className={styles.productGrid}>
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default CompareResultSkeleton;
