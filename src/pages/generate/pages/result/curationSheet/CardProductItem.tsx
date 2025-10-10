import { memo } from 'react';

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

    const handleToggle = () => {
      const wasSaved = isSaved;

      toggleJjym(recommendId, {
        onSuccess: (data) => {
          if (!wasSaved && data.favorited) {
            notify({
              text: '상품을 찜했어요! 위시리스트로 이동할까요?',
              type: TOAST_TYPE.NAVIGATE,
              onClick: onGotoMypage,
              options: { style: { marginBottom: '2rem' } },
            });
          }
        },
      });
    };

    return (
      <CardProduct
        key={product.furnitureProductId}
        size="large"
        title={product.furnitureProductName}
        brand={product.furnitureProductMallName}
        imageUrl={product.furnitureProductImageUrl}
        linkHref={product.furnitureProductSiteUrl}
        isSaved={isSaved}
        onToggleSave={handleToggle}
      />
    );
  }
);

CardProductItem.displayName = 'CardProductItem';
