import type { PriceInfo, ProductInfo } from '@shared/types/productCard';

import { LOGIN_ENTRY_ROUTE } from '@analytics/params/gate';

import emptyImage from '@assets/images/ImgEmpty.png';

import Icon from '@components/icon/Icon';
import OptimizedImage from '@components/image/OptimizedImage';

import { useProductLink } from '@hooks/useProductLink';

import { getPriceTexts } from '@utils/productCardUtils';

import * as styles from './OutputLink.css';

interface OutputLinkProps {
  product: ProductInfo;
  price?: PriceInfo;
  href?: string;
  onSearchNewLink?: () => void;
}

const OutputLink = ({
  product,
  price,
  href,
  onSearchNewLink,
}: OutputLinkProps) => {
  const { openProductLink } = useProductLink();
  const { originalPriceText, discountPriceText, discountRateText } =
    getPriceTexts(price?.original, price?.discount, price?.discountRate);
  const priceText = discountPriceText ?? originalPriceText;
  const isProductClickable = Boolean(href);
  const handleProductClick = isProductClickable
    ? () =>
        openProductLink(href, undefined, LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SITE)
    : undefined;

  // 클릭 동작이 없으면 버튼으로 그리지 않는다 — 포커스는 받는데 아무 일도 안 하는 요소가 되기 때문
  const ContentTag = isProductClickable ? 'button' : 'div';

  return (
    <section className={styles.container} aria-label="검색한 상품">
      <ContentTag
        type={isProductClickable ? 'button' : undefined}
        className={styles.contentButton}
        onClick={handleProductClick}
        aria-label={
          isProductClickable ? `${product.title} 상품 링크로 이동` : undefined
        }
      >
        <span className={styles.titleRow}>
          <Icon name="Link" size="24" decorative />
          <span className={styles.title}>검색한 상품</span>
        </span>

        <span className={styles.productCard}>
          <span className={styles.imgSection}>
            <OptimizedImage
              src={product.imageUrl || emptyImage}
              fallbackSrc={emptyImage}
              placeholder="skeleton"
              className={styles.cardImage}
              alt=""
            />
          </span>

          <span className={styles.infoSection}>
            {product.brand ? (
              <span className={styles.brandText}>{product.brand}</span>
            ) : null}
            <span className={styles.productText}>{product.title}</span>
            {(priceText || discountRateText) && (
              <span className={styles.priceRow}>
                {discountRateText ? (
                  <span className={styles.discountRateText}>
                    {discountRateText}
                  </span>
                ) : null}
                {priceText ? (
                  <span className={styles.discountPriceText}>{priceText}</span>
                ) : null}
              </span>
            )}
          </span>
        </span>
      </ContentTag>

      {onSearchNewLink ? (
        <button
          type="button"
          className={styles.searchButton}
          onClick={onSearchNewLink}
        >
          <span className={styles.searchButtonContent}>
            <Icon name="Search" size="16" decorative />
            <span className={styles.searchButtonText}>
              새로운 링크 검색하기
            </span>
          </span>
        </button>
      ) : null}
    </section>
  );
};

export default OutputLink;
