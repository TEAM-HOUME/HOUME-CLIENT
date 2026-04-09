import type { ComponentProps } from 'react';
import { useEffect, useId, useState } from 'react';

import clsx from 'clsx';

import Icon from '@shared/components/v2/icon/Icon';

import fallbackImage from '@assets/v2/images/CardRoomTypeFallback.svg';

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
  const [imageSrc, setImageSrc] = useState(initialImageSrc);
  const titleId = useId();
  const hasTitle = title != null && title !== '';
  const isLarge = size === 'L';
  const starIconSize = isLarge ? '24' : '16';
  const showLargeContents = isLarge && largeContents != null;

  useEffect(() => {
    setImageSrc(initialImageSrc);
  }, [initialImageSrc]);

  return (
    <div className={styles.wrapper({ scaleOnPress })}>
      <button
        type="button"
        className={clsx(styles.card({ size }), className)}
        onClick={onClick}
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-label={hasTitle ? undefined : '스타일 카드 선택'}
        {...rest}
      >
        <img
          src={imageSrc}
          alt=""
          aria-hidden
          className={styles.image}
          loading={imageLoading}
          decoding="async"
          draggable={false}
          onError={() => setImageSrc(fallbackImage)}
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
      </button>
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
