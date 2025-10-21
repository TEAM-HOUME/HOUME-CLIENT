import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import FilterChip from '@/pages/generate/components/filterChip/FilterChip';
import {
  filterMockData,
  productMockData,
} from '@/pages/generate/constants/curationMockdata';
import { useGetJjymListQuery } from '@/pages/mypage/hooks/useSaveItemList';
import { ROUTES } from '@/routes/paths';
import { useSavedItemsStore } from '@/store/useSavedItemsStore';
import { useUserStore } from '@/store/useUserStore';

import { CardProductItem } from './CardProductItem';
import * as styles from './CurationSheet.css';
import { CurationSheetWrapper } from './CurationSheetWrapper';

export const CurationSheet = () => {
  // 전역상태 사용
  const displayName = useUserStore((state) => state.userName ?? '사용자');

  const navigate = useNavigate();

  // 필터
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);

  const handleGotoMypage = () => {
    navigate(ROUTES.MYPAGE);
  };

  // 서버 찜 목록 불러오기
  const { data: jjymItems = [] } = useGetJjymListQuery();
  const setSavedProductIds = useSavedItemsStore((s) => s.setSavedProductIds);

  useEffect(() => {
    // 추천ID(recommendId) 기준으로 맞춰서 넣기
    const ids = jjymItems.map((item) => item.id);
    setSavedProductIds(ids);
  }, [jjymItems, setSavedProductIds]);

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
            {/* TODO: 목데이터 사용 > 실제 api 연동 */}
            {productMockData.map((p) => (
              <CardProductItem
                key={p.furnitureProductId}
                product={p}
                onGotoMypage={handleGotoMypage}
              />
            ))}
          </div>
        </div>
      </div>
    </CurationSheetWrapper>
  );
};
