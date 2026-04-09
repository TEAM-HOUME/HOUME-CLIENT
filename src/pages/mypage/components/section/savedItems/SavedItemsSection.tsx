import { useEffect, useRef, useState } from 'react';

import { normalizeColorHexes } from '@pages/generate/pages/result/curationSection/curationProducts';
import { useGetJjymListQuery } from '@pages/mypage/apis/queries/useGetJjymListQuery';
import { logMyPageClickBtnFurnitureCard } from '@pages/mypage/utils/analytics';

import { useJjymMutation } from '@apis/mutations/useJjymMutation';

import { SESSION_STORAGE_KEYS } from '@constants/bottomSheet';

import ProductCard from '@/shared/components/v2/productCard/ProductCard';

import * as styles from './SavedItemsSection.css';
import EmptyStateSection from '../emptyState/EmptyStateSection';

const SavedItemsSection = () => {
  // 스크롤 포커스 id 가져오기
  const [focusItemId, setFocusItemId] = useState<string | null>(null);

  // 찜한 목록 조회
  const { data: savedItems = [], isFetched } = useGetJjymListQuery();

  // 찜 해제 토글
  const { mutate: toggleJjym } = useJjymMutation();

  const handleToggleSave = (id: number) => {
    toggleJjym(id);
  };

  // 자동 스크롤 포커싱
  const itemFocusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem(SESSION_STORAGE_KEYS.FOCUS_ITEM_ID);

    if (id) {
      setFocusItemId(id);
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.FOCUS_ITEM_ID);
    }
  }, []);

  // 데이터 로드 완료 후 스크롤 실행
  useEffect(() => {
    if (focusItemId && isFetched && itemFocusRef.current) {
      itemFocusRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [focusItemId, isFetched]);

  // 저장된 아이템이 없을 때
  if (isFetched && savedItems.length === 0) {
    return <EmptyStateSection type="savedItems" />;
  }

  return (
    <section className={styles.container}>
      <div className={styles.gridContainer}>
        {savedItems.map((item) => {
          const isTargetItem =
            String(item.rawProductId) === String(focusItemId);

          return (
            <div
              key={item.rawProductId}
              ref={isTargetItem ? itemFocusRef : null}
              className={styles.cardWrapper}
            >
              <ProductCard
                product={{
                  title: item.productName,
                  brand: item.brandName,
                  imageUrl: item.productImageUrl,
                  colorHexes: normalizeColorHexes(item.colors),
                }}
                price={{
                  original: item.listPrice,
                  discount: item.discountPrice,
                  discountRate: item.discountRate,
                }}
                save={{
                  isSaved: true,
                  onToggle: () => handleToggleSave(item.rawProductId),
                  count: item.jjymCount,
                }}
                link={{
                  href: item.productSiteUrl,
                  onClick: logMyPageClickBtnFurnitureCard,
                  label: '사이트',
                }}
                enableWholeCardLink={true}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SavedItemsSection;
