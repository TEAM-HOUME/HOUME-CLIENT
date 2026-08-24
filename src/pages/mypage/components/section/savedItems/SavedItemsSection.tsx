import { useEffect, useRef, useState } from 'react';

import { useMypageSavedItemsAnalytics } from '@pages/mypage/analytics/useMypageAnalytics';
import { useJjymListQuery } from '@pages/mypage/apis/queries/useJjymListQuery';

import { useSavedItemsStore } from '@store/useSavedItemsStore';

import { LOGIN_ENTRY_ROUTE } from '@analytics/params/gate';

import { useJjymMutation } from '@apis/mutations/useJjymMutation';

import ProductCard from '@components/productCard/ProductCard';

import { SESSION_STORAGE_KEYS } from '@constants/bottomSheet';

import { normalizeColorHexes } from '@utils/normalizeColorHexes';

import * as styles from './SavedItemsSection.css';
import EmptyStateSection from '../emptyState/EmptyStateSection';

const SavedItemsSection = () => {
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [isSavedItemsSynced, setIsSavedItemsSynced] = useState(false);
  const savedProductIds = useSavedItemsStore((state) => state.savedProductIds);
  const setSavedProductIds = useSavedItemsStore(
    (state) => state.setSavedProductIds
  );

  const { data: savedItems = [], isFetched } = useJjymListQuery({
    gcTime: 0,
    refetchOnMount: 'always',
  });

  const {
    handleFeedCardClick,
    handleFeedCardGoSiteClick,
    handleFeedCardSaveToggle,
  } = useMypageSavedItemsAnalytics({
    savedItems,
    isFetched,
  });

  const { mutate: toggleJjym } = useJjymMutation({
    savedToastType: 'none',
    invalidateSavedItemsList: false,
    loginEntryRoute: LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SAVE,
  });

  const handleToggleSave = (
    id: number,
    isSaved: boolean,
    item: (typeof savedItems)[number]
  ) => {
    handleFeedCardSaveToggle(item, isSaved);
    toggleJjym(id, { productName: item.productName });
  };

  const itemFocusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem(SESSION_STORAGE_KEYS.FOCUS_ITEM_ID);

    if (id) {
      setFocusItemId(id);
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.FOCUS_ITEM_ID);
    }
  }, []);

  useEffect(() => {
    if (!isFetched) return;

    setSavedProductIds(savedItems.map((item) => item.rawProductId));
    setIsSavedItemsSynced(true);
  }, [isFetched, savedItems, setSavedProductIds]);

  useEffect(() => {
    if (focusItemId && isFetched && itemFocusRef.current) {
      itemFocusRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [focusItemId, isFetched]);

  if (isFetched && savedItems.length === 0) {
    return <EmptyStateSection type="savedItems" />;
  }

  return (
    <section className={styles.container}>
      <div className={styles.gridContainer}>
        {savedItems.map((item) => {
          const isTargetItem =
            String(item.rawProductId) === String(focusItemId);
          const isSaved = isSavedItemsSynced
            ? savedProductIds.has(item.rawProductId)
            : true;
          const jjymCount = isSaved
            ? item.jjymCount
            : Math.max(0, item.jjymCount - 1);

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
                  isSaved,
                  onToggle: () =>
                    handleToggleSave(item.rawProductId, isSaved, item),
                  count: jjymCount,
                }}
                link={{
                  href: item.productSiteUrl,
                  label: '사이트',
                  onClick: () => handleFeedCardGoSiteClick(item),
                }}
                onCardClick={() => handleFeedCardClick(item)}
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
