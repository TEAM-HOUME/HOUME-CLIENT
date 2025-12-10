import { memo } from 'react';

import { useIsMutating } from '@tanstack/react-query';

import { useABTest } from '@/pages/generate/hooks/useABTest';
import { usePostJjymMutation } from '@/pages/generate/hooks/useSaveItem';
import {
  logResultImgClickCurationSheetBtnGoSite,
  logResultImgClickCurationSheetBtnSave,
  logResultImgClickCurationSheetCard,
} from '@/pages/generate/utils/analytics';
import CardProduct from '@/shared/components/card/cardProduct/CardProduct';
import { useToast } from '@/shared/components/toast/useToast';
import { SESSION_STORAGE_KEYS } from '@/shared/constants/bottomSheet';
import { TOAST_TYPE } from '@/shared/types/toast';
import { useSavedItemsStore } from '@/store/useSavedItemsStore';

interface CardProductItemProps {
  product: {
    id?: number; // recommendFurnitureId
    furnitureProductId: number;
    furnitureProductName: string;
    furnitureProductMallName: string;
    furnitureProductImageUrl: string;
    furnitureProductSiteUrl: string;
  };
  onGotoMypage: () => void;
}

const CardProductItem = memo(
  ({ product, onGotoMypage }: CardProductItemProps) => {
    const recommendId =
      typeof product.id === 'number' && Number.isFinite(product.id)
        ? product.id
        : null;
    const hasRecommendId = recommendId !== null;
    const { variant } = useABTest();

    const savedProductIds = useSavedItemsStore((s) => s.savedProductIds);
    const isSaved = hasRecommendId ? savedProductIds.has(recommendId) : false;
    const setHasShownFavoriteToast = useSavedItemsStore(
      (s) => s.setHasShownFavoriteToast
    ); // 찜 스낵바 노출 플래그 setter

    const { mutate: toggleJjym } = usePostJjymMutation();
    const { notify } = useToast();

    const isMutating =
      useIsMutating({
        predicate: (mutation) =>
          mutation.options.mutationKey?.[0] === 'jjym' &&
          mutation.state.variables === (recommendId ?? undefined), // 이 카드 id만 추적
      }) > 0;

    const handleNavigateAndFocus = () => {
      if (recommendId === null) return;
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.FOCUS_ITEM_ID,
        String(recommendId)
      ); // 세션 스토리지에 잠시 저장
      sessionStorage.setItem(SESSION_STORAGE_KEYS.ACTIVE_TAB, 'savedItems'); // Tab 정보
      onGotoMypage();
    };

    const handleToggle = () => {
      if (recommendId === null) {
        notify({
          text: '추천 ID가 없는 상품이라 찜할 수 없어요',
          type: TOAST_TYPE.INFO,
        });
        return;
      }
      if (isMutating) return;
      const wasSaved = isSaved;

      // 저장 버튼 클릭 이벤트 전송
      logResultImgClickCurationSheetBtnSave(variant);

      toggleJjym(recommendId, {
        onSuccess: (data) => {
          const { hasShownFavoriteToast } = useSavedItemsStore.getState();
          if (!wasSaved && data.favorited && !hasShownFavoriteToast) {
            // 스낵바 중복 노출 방지 가드
            notify({
              text: '상품을 찜했어요! 위시리스트로 이동할까요?',
              type: TOAST_TYPE.NAVIGATE,
              onClick: handleNavigateAndFocus,
              options: { style: { marginBottom: '2rem' } },
            });
            setHasShownFavoriteToast(true);
          }
        },
      });
    };

    return (
      <CardProduct
        size="large"
        title={product.furnitureProductName}
        brand={product.furnitureProductMallName}
        imageUrl={product.furnitureProductImageUrl}
        linkHref={product.furnitureProductSiteUrl}
        isSaved={isSaved}
        onToggleSave={handleToggle}
        disabled={isMutating || !hasRecommendId}
        onLinkClick={() => {
          logResultImgClickCurationSheetBtnGoSite(variant);
        }}
        onCardClick={() => {
          logResultImgClickCurationSheetCard(variant);
        }}
      />
    );
  }
);

CardProductItem.displayName = 'CardProductItem';
export default CardProductItem;
