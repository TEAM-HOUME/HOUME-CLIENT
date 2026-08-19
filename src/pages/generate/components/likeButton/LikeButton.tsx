// like, dislike 버튼
import Icon from '@components/icon/Icon';

import * as styles from './LikeButton.css';

export interface LikeButtonProps
  extends Omit<React.ComponentProps<'button'>, 'children'> {
  name?: 'like' | 'dislike';
}

const LikeButton = ({
  name = 'like',
  type = 'button',
  disabled = false,
  ...props
}: LikeButtonProps) => {
  const isLike = name === 'like';
  return (
    <button
      type={type}
      className={styles.likeButton({ name })}
      disabled={disabled}
      aria-label={isLike ? '찜하기' : '넘기기'}
      {...props}
    >
      {isLike ? (
        <Icon name={'HeartFillWhite'} size={'32'} />
      ) : (
        <Icon name={'DislikeWhite'} size={'32'} />
      )}
    </button>
  );
};

export default LikeButton;
