import { useEffect, useState } from 'react';

import type {
  ProductInfo,
  PriceInfo,
  SaveInfo,
  LinkInfo,
} from '@shared/types/productCard';

import CardImage from '@assets/images/cardExImg.svg?url';

import {
  createCardClickHandler,
  getColorChips,
  getPriceTexts,
  type CardClickArea,
} from '@utils/productCardUtils';

import * as styles from './ListProductCard.css';
import IconButton from '../button/IconButton';

type CardSize = 's' | 'm';

interface ListProductCardProps {
  cardSize?: CardSize;
  product: ProductInfo;
  price?: PriceInfo;
  save: SaveInfo;
  link?: LinkInfo;
  disabled?: boolean;
  onCardClick?: (area?: CardClickArea) => void;
  enableWholeCardLink?: boolean;
}

const ListProductCard = ({
  cardSize = 'm',
  product,
  price,
  save,
  link,
  disabled = false,
  onCardClick,
  enableWholeCardLink = false,
}: ListProductCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const linkHref = link?.href;

  useEffect(() => {
    setIsLoaded(false);
  }, [product.imageUrl]);

  const { visibleColors, extraColorCount } = getColorChips(product.colorHexes);
  const { originalPriceText, discountPriceText, discountRateText } =
    getPriceTexts(price?.original, price?.discount, price?.discountRate);

  const { handleWrapperClick, handleWrapperKeyDown } = createCardClickHandler({
    onCardClick,
    enableWholeCardLink,
    linkHref,
  });

  return (
    <div
      className={`${styles.wrapper({ size: cardSize })} ${
        enableWholeCardLink ? styles.clickable : ''
      }`}
      onClick={handleWrapperClick}
      onKeyDown={handleWrapperKeyDown}
      role={enableWholeCardLink && linkHref ? 'link' : undefined}
      tabIndex={enableWholeCardLink && linkHref ? 0 : undefined}
      aria-label={
        enableWholeCardLink ? `${product.title} 상품 링크로 이동` : undefined
      }
    >
      <section
        className={styles.imgSection({ size: cardSize })}
        data-click-area="image"
      >
        {!isLoaded && <div className={styles.skeleton} />}
        <img
          className={styles.cardImage({ loaded: isLoaded, size: cardSize })}
          src={product.imageUrl || CardImage}
          alt="카드 이미지"
          onLoad={() => setIsLoaded(true)}
        />
      </section>

      <section className={styles.infoSection({ size: cardSize })}>
        {/* 색상 정보 */}
        {(visibleColors.length > 0 || extraColorCount > 0) && (
          <div className={styles.colorRow}>
            {visibleColors.map((hex, index) => (
              <div className={styles.colorChipContainer} key={index}>
                <span
                  key={`${hex}-${index}`}
                  className={styles.colorChip}
                  style={{ backgroundColor: hex }}
                  aria-hidden
                />
              </div>
            ))}
            {extraColorCount > 0 && (
              <span className={styles.colorChipCount}>+{extraColorCount}</span>
            )}
          </div>
        )}

        {/* 브랜드, 상품 이름 */}
        <div className={styles.productInfo} data-click-area="title">
          <p className={styles.productText}>{product.title}</p>
        </div>

        {/* 가격 정보 */}
        {(originalPriceText || discountPriceText) && (
          <div className={styles.priceSection}>
            {discountRateText ? (
              // 할인 있을 때
              <>
                {discountPriceText && (
                  <div className={styles.discountRow}>
                    {discountRateText && (
                      <span className={styles.discountRateText}>
                        {discountRateText}
                      </span>
                    )}
                    <span className={styles.discountPriceText}>
                      {discountPriceText}
                    </span>
                  </div>
                )}
              </>
            ) : (
              // 할인 없을 때
              originalPriceText && (
                <span className={styles.discountPriceText}>
                  {originalPriceText}
                </span>
              )
            )}
          </div>
        )}
      </section>

      {/* 아이콘 버튼 */}
      <div
        className={styles.btnContainer()}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="presentation"
      >
        <IconButton
          name="Link"
          size="S"
          disabled={disabled}
          onClick={link?.onClick}
          aria-label={'상품 링크로 이동'}
        />
        <IconButton
          name={save.isSaved ? 'HeartFillColor' : 'HeartStrokeGray'}
          size="S"
          disabled={disabled}
          onClick={save.onToggle}
        />
      </div>
    </div>
  );
};
export default ListProductCard;
