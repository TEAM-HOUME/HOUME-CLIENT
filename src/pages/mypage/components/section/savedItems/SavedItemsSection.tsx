import { useEffect, useRef, useState } from 'react';

import { usePostJjymMutation } from '@/pages/generate/hooks/useSaveItem';
import { useGetJjymListQuery } from '@/pages/mypage/hooks/useSaveItemList';
import { logMyPageClickBtnFurnitureCard } from '@/pages/mypage/utils/analytics';
import CardProduct from '@/shared/components/card/cardProduct/CardProduct';
import { SESSION_STORAGE_KEYS } from '@/shared/constants/bottomSheet';

import * as styles from './SavedItemsSection.css';
import EmptyStateSection from '../emptyState/EmptyStateSection';

const SavedItemsSection = () => {
  // 스크롤 포커스 id 가져오기
  const [focusItemId, setFocusItemId] = useState<string | null>(null);

  // 찜한 목록 조회
  const { data: savedItems = [], isFetched } = useGetJjymListQuery();

  // 찜 해제 토글
  const { mutate: toggleJjym } = usePostJjymMutation();

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
          const isTargetItem = String(item.id) === String(focusItemId);

          return (
            <div
              key={item.furnitureProductId}
              ref={isTargetItem ? itemFocusRef : null}
            >
              <CardProduct
                size="small"
                title={item.furnitureProductName}
                imageUrl={item.furnitureProductImageUrl}
                linkHref={item.furnitureProductSiteUrl}
                isSaved={true}
                onToggleSave={() => handleToggleSave(item.id)}
                onLinkClick={logMyPageClickBtnFurnitureCard}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SavedItemsSection;
