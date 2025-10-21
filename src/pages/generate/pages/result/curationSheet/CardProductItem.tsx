import { memo } from 'react';

import { useIsMutating } from '@tanstack/react-query';

import { usePostJjymMutation } from '@/pages/generate/hooks/useSaveItem';
import CardProduct from '@/shared/components/card/cardProduct/CardProduct';
import { useToast } from '@/shared/components/toast/useToast';
import { TOAST_TYPE } from '@/shared/types/toast';
import { useSavedItemsStore } from '@/store/useSavedItemsStore';

interface CardProductItemProps {
  product: {
    id: number; // recommendFurnitureId
    furnitureProductId: number;
    furnitureProductName: string;
    furnitureProductMallName: string;
    furnitureProductImageUrl: string;
    furnitureProductSiteUrl: string;
  };
  onGotoMypage: () => void;
}

export const CardProductItem = memo(
  ({ product, onGotoMypage }: CardProductItemProps) => {
    const recommendId = product.id;

    const isSaved = useSavedItemsStore((s) =>
      s.savedProductIds.has(recommendId)
    );

    const { mutate: toggleJjym } = usePostJjymMutation();
    const { notify } = useToast();

    const isMutating =
      useIsMutating({
        predicate: (mutation) =>
          mutation.options.mutationKey?.[0] === 'jjym' &&
          mutation.state.variables === recommendId, // 이 카드 id만 추적
      }) > 0;

    const handleNavigateAndFocus = () => {
      sessionStorage.setItem('focusItemId', String(recommendId)); // 세션 스톨지에 잠시 저장
      sessionStorage.setItem('activeTab', 'savedItems'); // Tab 정보
      onGotoMypage();
    };

    const handleToggle = () => {
      if (isMutating) return;
      const wasSaved = isSaved;

      toggleJjym(recommendId, {
        onSuccess: (data) => {
          if (!wasSaved && data.favorited) {
            notify({
              text: '상품을 찜했어요! 위시리스트로 이동할까요?',
              type: TOAST_TYPE.NAVIGATE,
              onClick: handleNavigateAndFocus,
              options: { style: { marginBottom: '2rem' } },
            });
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
        disabled={isMutating}
      />
    );
  }
);

CardProductItem.displayName = 'CardProductItem';
