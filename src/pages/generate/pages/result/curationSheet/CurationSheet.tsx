import { useState } from 'react';

import FilterChip from '@/pages/generate/components/filterChip/FilterChip';
import {
  filterMockData,
  productMockData,
} from '@/pages/generate/constants/curationMockdata';
import CardProduct from '@/shared/components/card/cardProduct/CardProduct';
import { useSavedItemsStore } from '@/store/useSavedItems';
import { useUserStore } from '@/store/useUserStore';

import * as styles from './CurationSheet.css';
import { CurationSheetWrapper } from './CurationSheetWrapper';

export const CurationSheet = () => {
  // 전역상태 사용
  const userName = useUserStore((state) => state.userName);
  const { savedProductIds, toggleSaveProduct } = useSavedItemsStore();

  // 필터
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);

  return (
    <CurationSheetWrapper>
      <div className={styles.filterSection}>
        {filterMockData.map((filter) => (
          <FilterChip
            key={filter.id}
            isSelected={selectedFilter === filter.id}
            onClick={() => setSelectedFilter(filter.id)}
          >
            {filter.furniture}
          </FilterChip>
        ))}
      </div>
      <div className={styles.scrollContentArea}>
        <p className={styles.headerText}>
          {userName}님의 취향에 딱 맞는 가구 추천
        </p>
        {/* 그리드 영역 */}
        <div className={styles.curationSection}>
          <div className={styles.gridbox}>
            {productMockData.map((p) => (
              <CardProduct
                key={p.id}
                size="large"
                title={p.title}
                brand={p.brand}
                imageUrl={p.imageUrl}
                linkHref={p.linkHref}
                isSaved={savedProductIds.has(p.id)}
                onToggleSave={() => toggleSaveProduct(p.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </CurationSheetWrapper>
  );
};
