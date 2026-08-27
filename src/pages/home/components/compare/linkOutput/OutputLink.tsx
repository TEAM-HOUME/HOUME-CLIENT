import type { PriceInfo, ProductInfo } from '@shared/types/productCard';

import emptyImage from '@assets/images/ImgEmpty.png';

import Icon from '@components/icon/Icon';
import OptimizedImage from '@components/image/OptimizedImage';

import { getPriceTexts } from '@utils/productCardUtils';

import * as styles from './OutputLink.css';

interface OutputLinkProps {
  product: ProductInfo;
  price?: PriceInfo;
  onProductClick?: () => void;
  onSearchNewLink?: () => void;
}

const OutputLink = ({
  product,
  price,
  onProductClick,
  onSearchNewLink,
}: OutputLinkProps) => {
  const { originalPriceText, discountPriceText, discountRateText } =
    getPriceTexts(price?.original, price?.discount, price?.discountRate);
  const priceText = discountPriceText ?? originalPriceText;

  return (
    <section className={styles.container} aria-label="검색한 상품">
      <button
        type="button"
        className={styles.contentButton}
        onClick={onProductClick}
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
      </button>

      <button
        type="button"
        className={styles.searchButton}
        onClick={onSearchNewLink}
      >
        <span className={styles.searchButtonContent}>
          <Icon name="Search" size="16" decorative />
          <span className={styles.searchButtonText}>새로운 링크 검색하기</span>
        </span>
      </button>
    </section>
  );
};

export default OutputLink;
