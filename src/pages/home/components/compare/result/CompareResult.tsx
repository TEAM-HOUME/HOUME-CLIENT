import { useState } from 'react';

import ActionButton from '@components/button/actionButton/ActionButton';
import Icon from '@components/icon/Icon';
import ProductCard from '@components/productCard/ProductCard';

import * as styles from './CompareResult.css';
import CompareSortDropdown from '../dropdown/SortDropdown';
import OutputLink from '../linkOutput/OutputLink';
import {
  DEFAULT_COMPARE_SORT_OPTION,
  sortCompareProducts,
  type CompareSortOption,
} from '../utils/sortCompareProducts';

import type { CompareResultViewModel } from '../utils/mapCompareResultToView';

interface CompareResultProps {
  /** "새로운 링크 검색하기"를 누르면 호출된다. 입력 화면으로 되돌아간다 */
  onSearchNewLink?: () => void;
  /** job·프리셋 결과를 같은 형태로 맞춘 값(mapCompareResultToView). 이 컴포넌트는 출처를 모른다 */
  viewModel: CompareResultViewModel;
}

const CompareResult = ({ onSearchNewLink, viewModel }: CompareResultProps) => {
  const [sortOption, setSortOption] = useState<CompareSortOption>(
    DEFAULT_COMPARE_SORT_OPTION
  );

  const sortedProducts = sortCompareProducts(
    viewModel.similarProducts,
    sortOption
  );

  return (
    <div className={styles.container}>
      {/*
       * TODO: Comparison_default 구현 후 상품/재검색 버튼에
       * 동일한 화면 전환 handler를 연결
       */}
      <OutputLink
        product={viewModel.searchedProduct.product}
        price={viewModel.searchedProduct.price}
        onSearchNewLink={onSearchNewLink}
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
              {viewModel.productCount}
            </span>
          </div>

          <div className={styles.sortRow}>
            <CompareSortDropdown value={sortOption} onChange={setSortOption} />
          </div>
        </header>

        <div className={styles.productGrid}>
          {sortedProducts.map((item) => (
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
            onClick={onSearchNewLink}
          >
            새로운 링크 검색하기
          </ActionButton>
        </div>
      </section>
    </div>
  );
};

export default CompareResult;
