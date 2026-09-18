import Icon from '@components/icon/Icon';

import * as styles from './CompareResultSkeleton.css';
import CompareSortDropdown from '../dropdown/SortDropdown';
import OutputLink from '../linkOutput/OutputLink';
import * as outputStyles from '../linkOutput/OutputLink.css';

import type { CompareSearchedProductView } from '../utils/mapCompareResultToView';

interface CompareResultSkeletonProps {
  /** 값이 있으면 "검색한 상품" 카드를 실제 값으로 그린다(job 생성 응답 즉시). 없으면 그 자리도 스켈레톤 */
  searchedProduct?: CompareSearchedProductView | null;
  /** "새로운 링크 검색하기" — 로딩 중에도 입력 화면으로 돌아갈 수 있다 */
  onSearchNewLink?: () => void;
}

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

const CompareResultSkeleton = ({
  searchedProduct,
  onSearchNewLink,
}: CompareResultSkeletonProps) => {
  return (
    <div
      className={styles.container}
      aria-busy="true"
      aria-label="비슷한 상품을 불러오는 중"
    >
      {searchedProduct ? (
        <OutputLink
          product={searchedProduct.product}
          price={searchedProduct.price}
          onSearchNewLink={onSearchNewLink}
        />
      ) : (
        <OutputLinkSkeleton />
      )}

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
          <CompareSortDropdown disabled />
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
