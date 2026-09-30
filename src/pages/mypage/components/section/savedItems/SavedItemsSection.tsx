import { useEffect, useRef, useState } from 'react';

import { useMypageSavedItemsAnalytics } from '@pages/mypage/analytics/useMypageAnalytics';

import { useSavedItemsStore } from '@store/useSavedItemsStore';

import { LOGIN_ENTRY_ROUTE } from '@analytics/params/gate';

import type { JjymV2ItemResponse } from '@apis/__generated__/data-contracts';
import { useJjymMutation } from '@apis/mutations/useJjymMutation';
import { useJjymListQuery } from '@apis/queries/useJjymListQuery';

import ProductCard from '@components/productCard/ProductCard';

import { SESSION_STORAGE_KEYS } from '@constants/bottomSheet';

import { useCompareJjymState } from '@hooks/useCompareJjymState';
import { useJjymToast } from '@hooks/useJjymToast';

import {
  resolveCompareJjymTarget,
  type CompareJjymTarget,
} from '@utils/compareJjym';
import { normalizeColorHexes } from '@utils/normalizeColorHexes';

import * as styles from './SavedItemsSection.css';
import EmptyStateSection from '../emptyState/EmptyStateSection';

const getSavedItemKey = (item: JjymV2ItemResponse) =>
  `${item.source ?? 'UNKNOWN'}:${item.rawProductId ?? item.catalogItemId ?? item.productSiteUrl ?? item.productName ?? 'UNKNOWN'}`;

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
  const {
    toggle: toggleCompareJjym,
    getSavedState: getCompareSavedState,
    isPending: isCompareJjymPending,
  } = useCompareJjymState();
  const { notifyJjymToast } = useJjymToast();

  const toggleCompareSavedItem = (
    target: CompareJjymTarget,
    showRemovedToast: boolean
  ) => {
    toggleCompareJjym(target, {
      onSuccess: (favorited) => {
        if (showRemovedToast && !favorited) {
          notifyJjymToast({
            favorited: false,
            onAction: () => toggleCompareSavedItem(target, false),
          });
        }
      },
    });
  };

  const handleToggleSave = (
    isSaved: boolean,
    item: (typeof savedItems)[number]
  ) => {
    handleFeedCardSaveToggle(item, isSaved);
    const compareTarget = resolveCompareJjymTarget(
      item.catalogItemId,
      item.source
    );

    if (compareTarget) {
      toggleCompareSavedItem(compareTarget, true);
      return;
    }

    if (item.rawProductId != null) {
      toggleJjym(item.rawProductId, { productName: item.productName });
    }
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

    setSavedProductIds(
      savedItems.flatMap((item) =>
        item.rawProductId == null ? [] : [item.rawProductId]
      )
    );
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
          const compareTarget = resolveCompareJjymTarget(
            item.catalogItemId,
            item.source
          );
          const isTargetItem =
            focusItemId != null &&
            ((item.rawProductId != null &&
              String(item.rawProductId) === focusItemId) ||
              (item.catalogItemId != null &&
                String(item.catalogItemId) === focusItemId));
          const isSaved = compareTarget
            ? getCompareSavedState(compareTarget, item.isJjym ?? true)
            : item.rawProductId != null && isSavedItemsSynced
              ? savedProductIds.has(item.rawProductId)
              : (item.isJjym ?? true);
          const itemJjymCount = item.jjymCount ?? 0;
          const jjymCount = isSaved
            ? itemJjymCount
            : Math.max(0, itemJjymCount - 1);
          const isCompareItemPending =
            compareTarget != null && isCompareJjymPending(compareTarget);

          return (
            <div
              key={getSavedItemKey(item)}
              ref={isTargetItem ? itemFocusRef : null}
              className={styles.cardWrapper}
            >
              <ProductCard
                product={{
                  title: item.productName ?? '',
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
                  onToggle: () => handleToggleSave(isSaved, item),
                  count: jjymCount,
                  disabled:
                    (item.rawProductId == null && compareTarget == null) ||
                    isCompareItemPending,
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
