import type { ComponentProps } from 'react';
import { useId } from 'react';

import clsx from 'clsx';

import emptyImage from '@assets/v2/images/ImgEmpty.png';

import Icon from '@components/icon/Icon';
import OptimizedImage from '@components/image/OptimizedImage';

import { IMAGE_SIZES } from '@utils/imageVariant';

import * as styles from './StyleCard.css';

export type StyleCardSize = 's' | 'L';

/** size=L 전용 카드 하단 제목·설명 블록 */
export type StyleCardLargeContents = {
  title: string;
  description: string;
};

type StyleCardProps = Omit<
  ComponentProps<'button'>,
  'children' | 'onClick' | 'type'
> & {
  size?: StyleCardSize;
  scaleOnPress?: boolean;
  imageSrc: string;
  title?: string;
  onClick?: () => void;
  imageLoading?: 'eager' | 'lazy';
  largeContents?: StyleCardLargeContents; // size=L 전용 (카드 하단 스타일 이름·설명 영역)
};

const StyleCard = ({
  className,
  size = 's',
  scaleOnPress = true,
  imageSrc: initialImageSrc,
  title,
  onClick,
  imageLoading = 'lazy',
  largeContents,
  ...rest
}: StyleCardProps) => {
  const titleId = useId();
  const hasTitle = title != null && title !== '';
  const isLarge = size === 'L';
  const starIconSize = isLarge ? '24' : '16';
  const showLargeContents = isLarge && largeContents != null;

  // onClick이 있을 때만 인터랙티브(버튼)로 렌더. 없으면 클릭/포커스/press 효과 없는 표시용 카드(div)
  // → 커서(button reset의 cursor:pointer)와 scaleOnPress가 non-interactive StyleCard에 적용되지 않음
  const isInteractive = onClick != null;
  const enableScale = isInteractive && scaleOnPress;

  const cardInner = (
    <>
      <OptimizedImage
        src={initialImageSrc}
        sizes={isLarge ? IMAGE_SIZES.full : IMAGE_SIZES.grid}
        fallbackSrc={emptyImage}
        alt=""
        aria-hidden
        className={styles.image}
        placeholder={isLarge ? 'color' : 'skeleton'}
        loading={imageLoading}
        decoding="async"
        draggable={false}
      />
      <div className={styles.gradient({ size })} aria-hidden />
      {isLarge ? (
        <div className={styles.largeHeader}>
          <div className={styles.starIcon({ size: 'L' })} aria-hidden>
            <Icon name="DoubleStar" size={starIconSize} />
          </div>
          {hasTitle ? (
            <p id={titleId} className={styles.largeInlineTitle}>
              {title}
            </p>
          ) : null}
        </div>
      ) : (
        <div className={styles.starIcon({ size: 's' })} aria-hidden>
          <Icon name="DoubleStar" size={starIconSize} />
        </div>
      )}
    </>
  );

  return (
    <div className={styles.wrapper({ scaleOnPress: enableScale, size })}>
      {isInteractive ? (
        <button
          type="button"
          className={clsx(styles.card({ size }), className)}
          onClick={onClick}
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-label={hasTitle ? undefined : '스타일 카드 선택'}
          {...rest}
        >
          {cardInner}
        </button>
      ) : (
        <div className={clsx(styles.card({ size }), className)}>
          {cardInner}
        </div>
      )}
      {!isLarge && hasTitle ? (
        <p id={titleId} className={styles.title({ size: 's' })}>
          {title}
        </p>
      ) : null}
      {showLargeContents ? (
        <div className={styles.largeFooter}>
          <p className={styles.largeFooterHeading}>{largeContents.title}</p>
          <p className={styles.largeFooterDescription}>
            {largeContents.description}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default StyleCard;
