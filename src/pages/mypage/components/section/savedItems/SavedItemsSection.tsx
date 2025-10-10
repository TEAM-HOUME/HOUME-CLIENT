import { usePostJjymMutation } from '@/pages/generate/hooks/useSaveItem';
import { useGetJjymList } from '@/pages/mypage/hooks/useSaveItemList';
import { queryClient } from '@/shared/apis/queryClient';
import CardProduct from '@/shared/components/card/cardProduct/CardProduct';
import { QUERY_KEY } from '@/shared/constants/queryKey';

import * as styles from './SavedItemsSection.css';
import EmptyStateSection from '../emptyState/EmptyStateSection';

const SavedItemsSection = () => {
  // 찜한 목록 조회
  const { data: savedItems = [], isFetched } = useGetJjymList();

  // 찜 해제 토글
  const { mutate: toggleJjym } = usePostJjymMutation();

  const handleToggleSave = (id: number) => {
    toggleJjym(id, {
      onSuccess: () => {
        // 목록 다시 요청
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.JJYM_LIST] });
      },
    });
  };

  // 저장된 아이템이 없을 때
  if (isFetched && savedItems.length === 0) {
    return <EmptyStateSection type="savedItems" />;
  }

  return (
    <section className={styles.container}>
      <div className={styles.gridContainer}>
        {savedItems.map((item) => (
          <CardProduct
            key={item.furnitureProductId}
            size="small"
            title={item.furnitureProductName}
            imageUrl={item.furnitureProductImageUrl}
            isSaved={true}
            onToggleSave={() => handleToggleSave(item.id)}
            // linkHref={item.furnitureProductSiteUrl}
          />
        ))}
      </div>
    </section>
  );
};

export default SavedItemsSection;
