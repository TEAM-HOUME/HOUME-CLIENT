import { useState } from 'react';

import FilterChip from '@/pages/generate/components/filterChip/FilterChip';
import {
  filterMockData,
  productMockData,
} from '@/pages/generate/constants/curationMockdata';
import CardProduct from '@/shared/components/card/cardProduct/CardProduct';
import { useUserStore } from '@/store/useUserStore';

import * as styles from './CurationSheet.css';
import { CurationSheetWrapper } from './CurationSheetWrapper';

export const CurationSheet = () => {
  const userName = useUserStore((state) => state.userName); // 전역상태 사용
  const [isSaved, setIsSaved] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);

  const handleSave = () => {
    setIsSaved((prev) => !prev);
  };
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
                isSaved={isSaved}
                onToggleSave={handleSave}
              />
            ))}
          </div>
        </div>
      </div>
    </CurationSheetWrapper>
  );
};
