import { LOGIN_ENTRY_ROUTE } from '@shared/analytics/params/gate';
import type {
  LinkInfo,
  PriceInfo,
  ProductInfo,
} from '@shared/types/productCard';

import emptyImage from '@assets/images/ImgEmpty.png';

import ActionButton from '@components/button/actionButton/ActionButton';
import Icon from '@components/icon/Icon';
import OptimizedImage from '@components/image/OptimizedImage';

import { useProductLink } from '@hooks/useProductLink';

import { getColorChips, getPriceTexts } from '@utils/productCardUtils';

import * as styles from './ProductDetailCard.css';

export interface ProductDetailCardProps {
  product: ProductInfo;
  price?: PriceInfo;
  saveCount?: number;
  link?: LinkInfo;
  linkHrefOverride?: string;
  isLoading?: boolean;
}

const ProductDetailCard = ({
  product,
  price,
  saveCount,
  link,
  linkHrefOverride,
  isLoading = false,
}: ProductDetailCardProps) => {
  const { openProductLink } = useProductLink();
  const { visibleColors, extraColorCount } = getColorChips(product.colorHexes);
  const { originalPriceText, discountPriceText, discountRateText } =
    getPriceTexts(price?.original, price?.discount, price?.discountRate);

  const linkHref = linkHrefOverride ?? link?.href;
  const hasDiscount =
    typeof price?.discountRate === 'number' &&
    Number.isFinite(price.discountRate) &&
    price.discountRate > 0;

  const hasColors = visibleColors.length > 0 || extraColorCount > 0;
  const hasSaveCount =
    typeof saveCount === 'number' && Number.isFinite(saveCount);
  const hasMetaRow = hasColors || hasSaveCount;
  const reserveMetaRow = isLoading && !hasMetaRow;

  const hasPrice = Boolean(originalPriceText || discountPriceText);
  const showBrandSkeleton = isLoading && !product.brand;
  const showPriceSkeleton = isLoading && !hasPrice;

  return (
    <div className={styles.card} aria-busy={isLoading}>
      <div className={styles.imageWrap}>
        <OptimizedImage
          className={styles.image}
          src={product.imageUrl || emptyImage}
          fallbackSrc={emptyImage}
          alt={product.title}
          placeholder="skeleton"
          loading="eager"
        />
        {linkHref ? (
          <div className={styles.linkBtnContainer()}>
            <ActionButton
              variant="solid"
              color="inverse"
              size="XS"
              leftIcon="Link"
              aria-label="공식 사이트로 이동"
              onClick={() =>
                openProductLink(
                  linkHref,
                  link?.onClick,
                  LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SITE
                )
              }
            >
              {link?.label || '사이트'}
            </ActionButton>
          </div>
        ) : null}
      </div>
      <div className={styles.info}>
        {(hasMetaRow || reserveMetaRow) && (
          <div className={styles.metaRow} aria-hidden={reserveMetaRow}>
            {hasColors ? (
              <div className={styles.colorRow}>
                {visibleColors.map((hex, index) => (
                  <div
                    className={styles.colorChipContainer}
                    key={`${hex}-${index}`}
                  >
                    <span
                      className={styles.colorChip}
                      style={{ backgroundColor: hex }}
                      aria-hidden
                    />
                  </div>
                ))}
                {extraColorCount > 0 ? (
                  <span className={styles.colorChipCount}>
                    +{extraColorCount}
                  </span>
                ) : null}
              </div>
            ) : null}
            {hasSaveCount ? (
              <div className={styles.likeRow}>
                <Icon name="HeartFillGray" size="14" />
                <span className={styles.likeCount}>
                  {saveCount.toLocaleString('ko-KR')}
                </span>
              </div>
            ) : null}
          </div>
        )}
        {product.brand ? (
          <p className={styles.brand}>{product.brand}</p>
        ) : showBrandSkeleton ? (
          <span className={styles.skeletonBrand} aria-hidden />
        ) : null}
        <p className={styles.title}>{product.title}</p>
        {hasPrice ? (
          <div className={styles.priceSection}>
            {hasDiscount && originalPriceText ? (
              <p className={styles.originalPrice}>{originalPriceText}</p>
            ) : null}
            <div className={styles.discountRow}>
              {hasDiscount && discountRateText ? (
                <span className={styles.discountRate}>{discountRateText}</span>
              ) : null}
              {discountPriceText && (
                <span className={styles.discountPrice}>
                  {discountPriceText}
                </span>
              )}
            </div>
          </div>
        ) : showPriceSkeleton ? (
          <div className={styles.priceSection} aria-hidden>
            {hasDiscount ? (
              <span className={styles.skeletonOriginalPrice} />
            ) : null}
            <span className={styles.skeletonDiscountPrice} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProductDetailCard;
