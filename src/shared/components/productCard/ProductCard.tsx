import { LOGIN_ENTRY_ROUTE } from '@shared/analytics/params/gate';
import type {
  LinkInfo,
  PriceInfo,
  ProductInfo,
  SaveInfo,
} from '@shared/types/productCard';

import emptyImage from '@assets/v2/images/ImgEmpty.png';

import OptimizedImage from '@components/image/OptimizedImage';

import { useProductLink } from '@hooks/useProductLink';

import {
  createCardClickHandler,
  getColorChips,
  getPriceTexts,
  stopCardClickPropagation,
  type CardClickArea,
} from '@utils/productCardUtils';

import * as styles from './ProductCard.css';
import ActionButton from '../button/actionButton/ActionButton';
import IconButton from '../button/IconButton';
import Icon from '../icon/Icon';

type CardType = 'default' | 'shopping';

interface ProductCardProps {
  cardType?: CardType;
  product: ProductInfo;
  price?: PriceInfo;
  save: SaveInfo;
  link?: LinkInfo;
  disabled?: boolean;
  onCardClick?: (area?: CardClickArea) => void;
  enableWholeCardLink?: boolean;
  shoppingAction?: {
    label?: string;
    onClick: () => void;
    disabled?: boolean;
    visualDisabled?: boolean;
  };
  onShoppingViewDetailClick?: () => void;
}

const ProductCard = ({
  cardType = 'default',
  product,
  price,
  save,
  link,
  disabled = false,
  onCardClick,
  enableWholeCardLink = false,
  shoppingAction,
  onShoppingViewDetailClick,
}: ProductCardProps) => {
  const isDefault = cardType === 'default';
  const isShoppingDetailClickable =
    cardType === 'shopping' && Boolean(onShoppingViewDetailClick);
  const isWholeCardLink = enableWholeCardLink && Boolean(link?.href);
  const isClickable = isShoppingDetailClickable || isWholeCardLink;

  const linkHref = link?.href;
  const { openProductLink } = useProductLink();

  const { visibleColors, extraColorCount } = getColorChips(product.colorHexes);
  const { originalPriceText, discountPriceText, discountRateText } =
    getPriceTexts(price?.original, price?.discount, price?.discountRate);

  const handleCardNavigate = () =>
    openProductLink(linkHref, undefined, LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SITE);

  const handleLinkButtonClick = () =>
    openProductLink(
      linkHref,
      link?.onClick,
      LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SITE
    );

  const { handleWrapperClick, handleWrapperKeyDown } = createCardClickHandler({
    onCardClick,
    enableWholeCardLink,
    linkHref,
    onNavigate: handleCardNavigate,
    onShoppingViewDetailClick: isShoppingDetailClickable
      ? onShoppingViewDetailClick
      : undefined,
  });

  const wrapperA11y = isShoppingDetailClickable
    ? {
        role: 'button' as const,
        tabIndex: 0,
        'aria-label': `${product.title} 자세히 보기`,
      }
    : isWholeCardLink
      ? {
          role: 'link' as const,
          tabIndex: 0,
          'aria-label': `${product.title} 상품 링크로 이동`,
        }
      : {};

  return (
    <div
      className={`${styles.wrapper()} ${isClickable ? styles.clickable : ''} ${
        isClickable && !disabled ? styles.pressable : ''
      }`}
      onClick={handleWrapperClick}
      onKeyDown={handleWrapperKeyDown}
      {...wrapperA11y}
    >
      <section className={styles.imgSection()} data-click-area="image">
        <OptimizedImage
          src={product.imageUrl || emptyImage}
          fallbackSrc={emptyImage}
          placeholder="skeleton"
          className={styles.cardImage}
          alt="카드 이미지"
        />

        <div
          className={styles.linkBtnContainer()}
          {...stopCardClickPropagation}
        >
          {isDefault && linkHref && (
            <ActionButton
              variant="solid"
              color="inverse"
              size="XS"
              leftIcon="Link"
              aria-label={'공식 사이트로 이동'}
              onClick={handleLinkButtonClick}
            >
              {link?.label || '사이트'}
            </ActionButton>
          )}
        </div>

        <div className={styles.saveBtnOverlay} {...stopCardClickPropagation}>
          {isDefault ? (
            <IconButton
              name={save.isSaved ? 'HeartFillColor' : 'HeartStrokeWhite'}
              size="S"
              disabled={disabled}
              onClick={save.onToggle}
            />
          ) : (
            <IconButton
              name="ViewDetail"
              size="S"
              disabled={disabled}
              onClick={onShoppingViewDetailClick}
            />
          )}
        </div>
      </section>

      <section className={styles.infoSection}>
        {/* 색상 정보 */}
        {(visibleColors.length > 0 || extraColorCount > 0) && isDefault && (
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

        <div className={styles.middleInfoSection({ cardType })}>
          {/* 브랜드, 상품 이름 */}
          <div className={styles.productInfo} data-click-area="title">
            {isDefault && !!product.brand && (
              <p className={styles.brandText}>{product.brand}</p>
            )}
            <p className={styles.productText}>{product.title}</p>
          </div>

          {/* 가격 정보 */}
          {(originalPriceText || discountPriceText) && (
            <div className={styles.priceSection}>
              {discountRateText ? (
                // 할인 있을 때
                <>
                  {isDefault && originalPriceText && (
                    <p className={styles.originalPriceText}>
                      {originalPriceText}
                    </p>
                  )}
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
        </div>

        {/* 저장(하트) 정보 */}
        {isDefault ? (
          typeof save.count === 'number' &&
          Number.isFinite(save.count) && (
            <div className={styles.saveCountRow}>
              <Icon name="HeartFillGray" size="14" />

              <span className={styles.saveCountText}>
                {save.count.toLocaleString('ko-KR')}
              </span>
            </div>
          )
        ) : (
          <div {...stopCardClickPropagation}>
            <ActionButton
              variant="outlined"
              color="inverse"
              size="S"
              fullWidth
              disabled={shoppingAction?.disabled}
              visualDisabled={shoppingAction?.visualDisabled}
              onClick={shoppingAction?.onClick}
            >
              {shoppingAction?.label ?? '선택'}
            </ActionButton>
          </div>
        )}
      </section>
    </div>
  );
};
export default ProductCard;
