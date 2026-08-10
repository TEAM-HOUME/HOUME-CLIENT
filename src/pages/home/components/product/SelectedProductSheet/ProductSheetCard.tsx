import type { KeyboardEvent } from 'react';

import type { SelectedProduct } from '@pages/home/types/productTab';

import emptyImage from '@assets/v2/images/ImgEmpty.png';

import IconButton from '@components/button/IconButton';
import Icon from '@components/icon/Icon';
import OptimizedImage from '@components/image/OptimizedImage';

import * as styles from './ProductSheetCard.css';

interface ProductSheetCardProps {
  layout: 'expanded' | 'compact';
  product: SelectedProduct;
  onCardClick: (product: SelectedProduct) => void;
  onRemoveClick: (id: number) => void;
}

const ProductSheetCard = ({
  layout,
  product,
  onCardClick,
  onRemoveClick,
}: ProductSheetCardProps) => {
  const isExpanded = layout === 'expanded';
  const formatPrice = (price: number) => price.toLocaleString('ko-KR');

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCardClick(product);
    }
  };

  return (
    <div
      className={
        isExpanded ? styles.selectedCardContainer : styles.compactSlotContainer
      }
    >
      <div
        className={isExpanded ? styles.selectedCard : styles.compactSlotFilled}
        role="button"
        tabIndex={0}
        aria-label={isExpanded ? undefined : `${product.title} 상세 보기`}
        onClick={() => onCardClick(product)}
        onKeyDown={handleCardKeyDown}
      >
        <div
          className={
            isExpanded ? styles.selectedImageWrap : styles.compactImageWrap
          }
        >
          {product.imageUrl ? (
            <OptimizedImage
              className={
                isExpanded ? styles.selectedImage : styles.compactImage
              }
              src={product.imageUrl}
              fallbackSrc={emptyImage}
              alt={isExpanded ? product.title : ''}
              placeholder="color"
            />
          ) : (
            <div
              className={
                isExpanded
                  ? styles.selectedImageFallback
                  : styles.compactImageFallback
              }
              aria-hidden
            >
              <Icon name="PlusFill" size={isExpanded ? '20' : '14'} />
            </div>
          )}
        </div>
        {isExpanded ? (
          <div className={styles.selectedInfoSection}>
            <p className={styles.selectedTitle}>{product.title}</p>
            <div className={styles.selectedPriceRow}>
              {product.discountRate > 0 && (
                <span className={styles.selectedDiscountRate}>
                  {product.discountRate}%
                </span>
              )}
              <span className={styles.selectedPrice}>
                {formatPrice(product.discountPrice)}
              </span>
            </div>
          </div>
        ) : null}
      </div>
      <IconButton
        name="CloseFillBlack"
        size={isExpanded ? 'M' : 'S'}
        className={styles.closeButton({ layout })}
        aria-label={`${product.title} 선택 해제`}
        onClick={() => onRemoveClick(product.id)}
      />
    </div>
  );
};

export default ProductSheetCard;
