import ArrowRightS from '@shared/assets/icons/ArrowRightS.svg?react';
import ArrowLeftS from '@shared/assets/icons/prevDisabled.svg?react';

import * as styles from './CurationSkeleton.css';

const SKELETON_CHIP_COUNT = 4;
const SKELETON_CARD_COUNT = 4;

/** 상품 카드 스켈레톤 */
const SkeletonCard = () => (
  <div className={styles.cardWrapper}>
    <div className={styles.cardImgSkeleton} />
    <div className={styles.cardInfoWrapper}>
      <div className={styles.cardBrandSkeleton} />
      <div className={styles.cardNameSkeleton} />
      <div className={styles.cardPriceWrapper}>
        <div className={styles.cardOriginalPriceSkeleton} />
        <div className={styles.cardDiscountPriceSkeleton} />
      </div>
    </div>
  </div>
);

/**
 * 결과 페이지 큐레이션 스켈레톤
 * - 이미지 영역 + 가구 큐레이션 리스트 로딩 상태
 */
const CurationSkeleton = () => {
  return (
    <>
      {/* 이미지 영역 스켈레톤 */}
      <div className={styles.imgContainer}>
        {/* 페이지 인디케이터 (우측 상단) */}
        <div className={styles.pageIndicator}>
          <span>0</span>
          <span>/</span>
          <span>0</span>
        </div>

        {/* 좌우 네비게이션 버튼 (세로 중앙) */}
        <div className={styles.pagination}>
          <div className={styles.navBtn}>
            <div
              className={`${styles.navIconFrame} ${styles.navIconFrameLeft}`}
            >
              <ArrowLeftS />
            </div>
          </div>
          <div className={styles.navBtn}>
            <div
              className={`${styles.navIconFrame} ${styles.navIconFrameRight}`}
            >
              <ArrowRightS />
            </div>
          </div>
        </div>
      </div>

      {/* 큐레이션 리스트 스켈레톤 */}
      <div className={styles.listContainer}>
        <div className={styles.titleSkeleton} />

        {/* 필터칩 리스트 스켈레톤 */}
        <div className={styles.filterSection}>
          {Array.from({ length: SKELETON_CHIP_COUNT }, (_, i) => (
            <div key={i} className={styles.filterChipSkeleton} />
          ))}
        </div>

        {/* 가구 큐레이션 리스트 스켈레톤 */}
        <div className={styles.gridBox}>
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </>
  );
};

export default CurationSkeleton;
