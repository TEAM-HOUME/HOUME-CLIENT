import CardImage from '@assets/images/cardExImg.svg?react';
import LinkButton from '@components/button/linkButton/LinkButton';
import SaveButton from '@components/button/saveButton/SaveButton';

import * as styles from './CardProduct.css';

type CardSize = 'small' | 'large';

interface CardProductProps {
  size: CardSize;
  title: string;
  brand?: string;
  // image: string;
  isSaved: boolean;
  onToggleSave: () => void;
  linkHref?: string;
  linkLabel?: string;
}

const CardProduct = ({
  size,
  title,
  brand,
  isSaved,
  onToggleSave,
  linkHref,
  linkLabel = '사이트',
}: CardProductProps) => {
  const isLarge = size === 'large';

  return (
    <div className={styles.wrapper({ size })}>
      <section className={styles.imgSection({ size })}>
        <CardImage />
        <div className={styles.linkBtnContainer}>
          <LinkButton
            href={linkHref}
            typeVariant={isLarge ? 'withText' : 'onlyIcon'}
            aria-label="공식 사이트로 이동"
          >
            {isLarge && linkLabel}
          </LinkButton>
        </div>
      </section>
      <section className={styles.bottomSection}>
        <div className={styles.textContainer}>
          <p className={styles.productText}>{title}</p>
          {isLarge && <p className={styles.brandText}>{brand}</p>}
        </div>
        <div className={styles.saveBtnContainer}>
          <SaveButton isSelected={isSaved} onClick={onToggleSave} />
        </div>
      </section>
    </div>
  );
};

export default CardProduct;
