import { useCallback } from 'react';

import { overlay } from 'overlay-kit';

import ProductDetailOverlay from '@pages/home/components/product/productPopup/ProductDetailOverlay';
import type { SelectedProduct } from '@pages/home/types/productTab';

import Icon from '@components/icon/Icon';

import ProductSheetCard from './ProductSheetCard';
import * as styles from './SelectedProductSheet.css';

interface SelectedProductSheetProps {
  expanded: boolean;
  /** 스크롤 다운 최소화 상태. 헤더를 접어서 숨김 (기본: false) */
  minimized?: boolean;
  selectedProducts: SelectedProduct[];
  onRemoveProduct: (id: number) => void;
  onAddProductClick?: () => void;
  onItemClick?: (product: SelectedProduct) => void;
  maxCount?: number;
}

const SelectedProductSheet = ({
  expanded,
  minimized = false,
  selectedProducts,
  onRemoveProduct,
  onAddProductClick,
  onItemClick,
  maxCount = 6,
}: SelectedProductSheetProps) => {
  const selectedCount = selectedProducts.length;
  const emptyCount = Math.max(maxCount - selectedCount, 0);
  const visibleProducts = selectedProducts.slice(0, maxCount);

  const handleRemoveProductClick = useCallback(
    (id: number) => {
      onRemoveProduct(id);
    },
    [onRemoveProduct]
  );

  const handleSaveToggleNoop = useCallback(() => {}, []);

  const handleSelectedCardClick = useCallback(
    (product: SelectedProduct) => {
      onItemClick?.(product);

      overlay.open(({ unmount }) => (
        <ProductDetailOverlay
          unmount={unmount}
          id={product.id}
          product={{
            title: product.title,
            brand: product.brand,
            imageUrl: product.imageUrl,
          }}
          price={{
            original: product.originalPrice,
            discountRate: product.discountRate,
            discount: product.discountPrice,
          }}
          save={{
            isSaved: false,
            onToggle: handleSaveToggleNoop,
          }}
          // 선택시트에서 연 상세에서도 사이트 이동(shop_feedDetailMDGoSite_click)이 추적되도록 link 전달
          // (href는 오버레이가 상품 상세 조회로 resolve — 다른 진입로와 동일)
          link={{}}
          shoppingAction={{
            label: '선택됨',
            disabled: true,
          }}
          listCategoryName={product.categoryName}
        />
      ));
    },
    [handleSaveToggleNoop, onItemClick]
  );

  return (
    <div className={styles.container({ minimized })}>
      <div className={styles.headerRow({ minimized })}>
        <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size="16" />
        <p className={styles.title}>선택한 상품</p>
        <span className={styles.count}>
          (<span className={styles.selectedCount}>{selectedCount}</span>/
          {maxCount})
        </span>
      </div>

      {expanded ? (
        <div className={styles.expandedGrid}>
          {visibleProducts.map((product) => (
            <ProductSheetCard
              key={product.id}
              layout="expanded"
              product={product}
              onCardClick={handleSelectedCardClick}
              onRemoveClick={handleRemoveProductClick}
            />
          ))}
          {Array.from({ length: emptyCount }).map((_, index) => (
            <div key={`empty-${index}`} className={styles.expandedGridSlot}>
              <div className={styles.addCardSquare} onClick={onAddProductClick}>
                <div className={styles.addCardContent} aria-hidden>
                  <Icon name="PlusFill" size="20" />
                  <p className={styles.addLabel}>상품 추가하기</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.compactRow} aria-label="선택한 상품 미리보기">
          {visibleProducts.map((product) => (
            <ProductSheetCard
              key={product.id}
              layout="compact"
              product={product}
              onCardClick={handleSelectedCardClick}
              onRemoveClick={handleRemoveProductClick}
            />
          ))}
          {Array.from({ length: emptyCount }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className={styles.compactSlot}
              onClick={onAddProductClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectedProductSheet;
