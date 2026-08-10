import { LOGIN_ENTRY_ROUTE } from '@shared/analytics/params/gate';
import type {
  ProductInfo,
  PriceInfo,
  SaveInfo,
  LinkInfo,
} from '@shared/types/productCard';

import emptyImage from '@assets/v2/images/ImgEmpty.png';

import OptimizedImage from '@components/image/OptimizedImage';

import { useProductLink } from '@hooks/useProductLink';

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
  const linkHref = link?.href;
  const { openProductLink } = useProductLink();
  const isWholeCardLink = enableWholeCardLink && Boolean(linkHref);

  const { visibleColors, extraColorCount } = getColorChips(product.colorHexes);
  const { originalPriceText, discountPriceText, discountRateText } =
    getPriceTexts(price?.original, price?.discount, price?.discountRate);

  const handleCardNavigate = () =>
    openProductLink(linkHref, undefined, LOGIN_ENTRY_ROUTE.PRODUCT_LIST_SITE);

  const handleLinkButtonClick = () =>
    openProductLink(
      linkHref,
      link?.onClick,
      LOGIN_ENTRY_ROUTE.PRODUCT_LIST_SITE
    );

  const { handleWrapperClick, handleWrapperKeyDown } = createCardClickHandler({
    onCardClick,
    enableWholeCardLink,
    linkHref,
    onNavigate: handleCardNavigate,
  });

  return (
    <div
      className={`${styles.wrapper({ size: cardSize })} ${
        isWholeCardLink ? styles.clickable : ''
      } ${isWholeCardLink && !disabled ? styles.pressable : ''}`}
      onClick={handleWrapperClick}
      onKeyDown={handleWrapperKeyDown}
      role={isWholeCardLink ? 'link' : undefined}
      tabIndex={isWholeCardLink ? 0 : undefined}
      aria-label={
        isWholeCardLink ? `${product.title} 상품 링크로 이동` : undefined
      }
    >
      <section
        className={styles.imgSection({ size: cardSize })}
        data-click-area="image"
      >
        <OptimizedImage
          src={product.imageUrl || emptyImage}
          fallbackSrc={emptyImage}
          placeholder="skeleton"
          className={styles.cardImage({ size: cardSize })}
          alt="카드 이미지"
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
                    {discountRateText && discountRateText !== '0%' && (
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
              (discountPriceText || originalPriceText) && (
                <span className={styles.discountPriceText}>
                  {discountPriceText ?? originalPriceText}
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
          onClick={handleLinkButtonClick}
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
