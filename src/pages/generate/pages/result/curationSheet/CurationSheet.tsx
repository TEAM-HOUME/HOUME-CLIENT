import { useState } from 'react';

import FilterChip from '@/pages/generate/components/filterChip/FilterChip';
import {
  filterMockData,
  productMockData,
} from '@/pages/generate/constants/curationMockdata';
import CardProduct from '@/shared/components/card/cardProduct/CardProduct';
import { useUserStore } from '@/store/useUserStore';

import { BottomSheetWrapper } from '@components/bottomSheet/BottomSheetWrapper';

import * as styles from './CurationSheet.css';

interface CurationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
}

export const CurationSheet = ({
  isOpen,
  onClose,
  onExited,
}: CurationSheetProps) => {
  const userName = useUserStore((state) => state.userName);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(1);

  const handleSave = () => {
    setIsSaved((prev) => !prev);
  };
  return (
    <BottomSheetWrapper
      isOpen={isOpen}
      onClose={onClose}
      onExited={onExited}
      typeVariant="curation"
    >
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
        <div className={styles.curationSection}>
          <div className={styles.wrapper}>
            <div className={styles.container}>
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
        </div>
      </div>
    </BottomSheetWrapper>
  );
};
