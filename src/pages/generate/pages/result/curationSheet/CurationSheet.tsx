import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import FilterChip from '@/pages/generate/components/filterChip/FilterChip';
import {
  filterMockData,
  productMockData,
} from '@/pages/generate/constants/curationMockdata';
import { ROUTES } from '@/routes/paths';
import CardProduct from '@/shared/components/card/cardProduct/CardProduct';
import { useToast } from '@/shared/components/toast/useToast';
import { TOAST_TYPE } from '@/shared/types/toast';
import { useSavedItemsStore } from '@/store/useSavedItems';
import { useUserStore } from '@/store/useUserStore';

import * as styles from './CurationSheet.css';
import { CurationSheetWrapper } from './CurationSheetWrapper';

export const CurationSheet = () => {
  // 전역상태 사용
  const displayName = useUserStore((state) => state.userName ?? '사용자');

  const savedProductIds = useSavedItemsStore((state) => state.savedProductIds);
  const toggleSaveProduct = useSavedItemsStore(
    (state) => state.toggleSaveProduct
  );

  const navigate = useNavigate();

  // 필터
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);

  // 찜하기
  const { notify } = useToast();

  const handleSaveClick = (productId: number) => {
    // 현재 저장상태 확인
    const isCurrentlySaved = savedProductIds.has(productId);

    // 상태 변경
    toggleSaveProduct(productId);

    if (!isCurrentlySaved) {
      notify({
        text: '상품을 찜했어요! 위시리스트로 이동할까요?',
        type: TOAST_TYPE.NAVIGATE,
        onClick: handleGotoMypage,
        options: {
          style: { marginBottom: '2rem' },
        },
      });
    }
  };

  const handleGotoMypage = () => {
    navigate(ROUTES.MYPAGE);
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
          {displayName}님의 취향에 딱 맞는 가구 추천
        </p>
        {/* 그리드 영역 */}
        <div className={styles.curationSection}>
          <div className={styles.gridbox}>
            {productMockData.map((p) => (
              <CardProduct
                key={p.furnitureProductId}
                size="large"
                title={p.furnitureProductName}
                brand={p.furnitureProductMallName}
                imageUrl={p.furnitureProductImageUrl}
                linkHref={p.furnitureProductSiteUrl}
                isSaved={savedProductIds.has(p.furnitureProductId)}
                onToggleSave={() => handleSaveClick(p.furnitureProductId)}
              />
            ))}
          </div>
        </div>
      </div>
    </CurationSheetWrapper>
  );
};
