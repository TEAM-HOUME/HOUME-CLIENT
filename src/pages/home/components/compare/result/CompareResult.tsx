import ActionButton from '@components/button/actionButton/ActionButton';
import Icon from '@components/icon/Icon';
import ProductCard from '@components/productCard/ProductCard';

import * as styles from './CompareResult.css';
import {
  MOCK_SEARCHED_PRODUCT,
  MOCK_SIMILAR_PRODUCT_COUNT,
  MOCK_SIMILAR_PRODUCTS,
} from './mockCompareResult';
import CompareSortDropdown from '../dropdown/SortDropdown';
import OutputLink from '../linkOutput/OutputLink';

const CompareResult = () => {
  return (
    <div className={styles.container}>
      {/*
       * TODO: Comparison_default 구현 후 상품/재검색 버튼에
       * 동일한 화면 전환 handler를 연결
       */}
      <OutputLink
        product={MOCK_SEARCHED_PRODUCT.product}
        price={MOCK_SEARCHED_PRODUCT.price}
      />

      <section
        className={styles.productSection}
        aria-labelledby="similar-product-title"
      >
        <header>
          <div className={styles.titleRow}>
            <Icon name="DoubleStarFillBlack" size="20" decorative />
            <h2 id="similar-product-title" className={styles.title}>
              비슷한 상품
            </h2>
            <span className={styles.productCount}>
              {MOCK_SIMILAR_PRODUCT_COUNT}
            </span>
          </div>

          <div className={styles.sortRow}>
            <CompareSortDropdown />
          </div>
        </header>

        <div className={styles.productGrid}>
          {MOCK_SIMILAR_PRODUCTS.map((item) => (
            <ProductCard
              key={item.id}
              product={item.product}
              price={item.price}
              save={item.save}
              link={item.link}
              benefitAmount={item.benefitAmount}
              enableWholeCardLink
            />
          ))}
        </div>

        <div className={styles.bottomContents}>
          <p className={styles.notice}>
            <Icon name="InfoCircleGray" size="16" decorative />
            하우미는 상품 판매 주체가 아닙니다.
          </p>

          <ActionButton
            variant="outlined"
            color="inverse"
            size="M"
            leftIcon="Search"
          >
            새로운 링크 검색하기
          </ActionButton>
        </div>
      </section>
    </div>
  );
};

export default CompareResult;
