import { useCallback } from 'react';

import {
  trackShopFeedCardSelectClick,
  trackShopFeedCardUnselectClick,
} from '@pages/home/analytics/shopAnalytics';
import type { ProductSearchCardItem } from '@pages/home/hooks/useProductSearch';
import { MAX_SELECTED_PRODUCTS } from '@pages/home/hooks/useProductSelection';
import type { SelectedProduct } from '@pages/home/types/productTab';
import { withProductSubCategory } from '@pages/home/utils/productFilterUtils';

import ProductCard from '@components/productCard/ProductCard';

import * as styles from './RecommendSection.css';

interface RecommendSectionProps {
  products: ProductSearchCardItem[];
  selectedProductIds: number[];
  onSelectProduct: (product: SelectedProduct) => void;
  onSelectProductFromDetailModal: (product: SelectedProduct) => void;
  furnitureSubCategoryByNameKr: Record<string, string>;
  onOpenProductDetail: (
    id: number,
    cardProduct: {
      title: string;
      brand: string;
      imageUrl: string;
      colorHexes: string[];
    },
    cardPrice: {
      original: number;
      discountRate: number;
      discount: number;
    },
    cardSave: { isSaved: false; onToggle: () => void; count: number },
    cardLink: { href: string },
    confirmAction: {
      label: string;
      disabled?: boolean;
      onConfirmSelect: () => void;
    },
    analyticsProduct: SelectedProduct
  ) => void;
}

const RecommendSection = ({
  products,
  selectedProductIds,
  onSelectProduct,
  onSelectProductFromDetailModal,
  furnitureSubCategoryByNameKr,
  onOpenProductDetail,
}: RecommendSectionProps) => {
  const handleSaveToggleNoop = useCallback(() => {}, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label="추천 상품">
      <h2 className={styles.title}>이런 상품은 어떠세요?</h2>
      <div className={styles.productGrid}>
        {products.map((item) => {
          const {
            id,
            title,
            brand,
            categoryName,
            imageUrl,
            discountRate,
            originalPrice,
            discountPrice,
            colorHexes,
            saveCount,
            linkUrl,
          } = item;
          const isSelected = selectedProductIds.includes(id);
          const cardProduct = {
            title,
            brand,
            imageUrl,
            colorHexes,
          };
          const cardPrice = {
            original: originalPrice,
            discountRate,
            discount: discountPrice,
          };
          const cardSave = {
            isSaved: false as const,
            onToggle: handleSaveToggleNoop,
            count: saveCount,
          };
          const cardLink = { href: linkUrl };
          const selectedProduct = withProductSubCategory(
            {
              id,
              title,
              brand,
              categoryName,
              imageUrl,
              originalPrice,
              discountPrice,
              discountRate,
            },
            furnitureSubCategoryByNameKr
          );
          const cardShoppingAction = {
            label: isSelected ? '선택됨' : '선택',
            visualDisabled: isSelected,
            onClick: () => {
              if (isSelected) {
                trackShopFeedCardUnselectClick();
                return;
              }

              // cap 도달 시 선택은 거부(토스트)되므로, 실제 선택되는 경우에만 select 이벤트 발사
              if (selectedProductIds.length < MAX_SELECTED_PRODUCTS) {
                trackShopFeedCardSelectClick(
                  selectedProduct,
                  [...selectedProductIds, id].join(', ')
                );
              }
              onSelectProduct(selectedProduct);
            },
          };
          const detailConfirmAction = {
            label: isSelected ? '선택됨' : '선택',
            disabled: isSelected,
            onConfirmSelect: () => {
              if (isSelected) return;
              onSelectProductFromDetailModal(selectedProduct);
            },
          };

          return (
            <div key={id}>
              <ProductCard
                cardType="shopping"
                product={cardProduct}
                price={cardPrice}
                save={cardSave}
                link={cardLink}
                shoppingAction={cardShoppingAction}
                onShoppingViewDetailClick={() =>
                  onOpenProductDetail(
                    id,
                    cardProduct,
                    cardPrice,
                    cardSave,
                    cardLink,
                    detailConfirmAction,
                    selectedProduct
                  )
                }
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecommendSection;
