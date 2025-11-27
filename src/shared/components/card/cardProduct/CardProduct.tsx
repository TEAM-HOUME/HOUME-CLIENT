import CardImage from '@assets/images/cardExImg.svg?url';
import LinkButton from '@components/button/linkButton/LinkButton';
import SaveButton from '@components/button/saveButton/SaveButton';

import * as styles from './CardProduct.css';

type CardSize = 'small' | 'large';

interface CardProductProps {
  size: CardSize;
  title: string;
  brand?: string;
  imageUrl?: string;
  isSaved: boolean;
  onToggleSave: () => void;
  linkHref?: string;
  linkLabel?: string;
  disabled?: boolean;
  onLinkClick?: () => void;
  onCardClick?: () => void;
}

const CardProduct = ({
  size,
  title,
  brand,
  imageUrl,
  isSaved,
  onToggleSave,
  linkHref,
  linkLabel = '사이트',
  disabled = false,
  onLinkClick,
  onCardClick,
}: CardProductProps) => {
  const isLarge = size === 'large';

  return (
    <div className={styles.wrapper({ size })} onClick={onCardClick}>
      <section className={styles.imgSection({ size })}>
        <img
          className={styles.cardImage}
          src={imageUrl || CardImage}
          alt="카드 이미지"
        />
        <div className={styles.linkBtnContainer}>
          {linkHref && (
            <LinkButton
              href={linkHref}
              typeVariant={isLarge ? 'withText' : 'onlyIcon'}
              aria-label={isLarge ? undefined : '공식 사이트로 이동'}
              onClick={onLinkClick}
            >
              {isLarge && linkLabel}
            </LinkButton>
          )}
        </div>
      </section>
      <section className={styles.bottomSection}>
        <div className={styles.textContainer}>
          <p className={styles.productText}>{title}</p>
          {isLarge && !!brand && <p className={styles.brandText}>{brand}</p>}
        </div>
        <div className={styles.saveBtnContainer}>
          <SaveButton
            disabled={disabled}
            isSelected={isSaved}
            onClick={onToggleSave}
          />
        </div>
      </section>
    </div>
  );
};
export default CardProduct;
