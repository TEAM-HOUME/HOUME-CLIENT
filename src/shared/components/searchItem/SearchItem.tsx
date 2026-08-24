import emptyImage from '@assets/images/ImgEmpty.png';

import Icon from '@components/icon/Icon';
import OptimizedImage from '@components/image/OptimizedImage';

import * as styles from './SearchItem.css';

interface SearchItemBaseProps {
  name: string;
  imageSrc?: string;
  onClick: () => void;
}

export type SearchItemProps =
  | (SearchItemBaseProps & {
      type: 'recent';
      searchDayCount: number;
    })
  | (SearchItemBaseProps & {
      type: 'popular';
    });

const TYPE_ICON = {
  recent: 'History',
  popular: 'Fire',
} as const;

const SearchItem = (props: SearchItemProps) => {
  const { type, name, imageSrc, onClick } = props;

  return (
    <button
      type="button"
      className={styles.wrapper({ type })}
      onClick={onClick}
    >
      <div className={styles.contents}>
        <div className={styles.iconGroup}>
          <span className={styles.icon} aria-hidden>
            <Icon name={TYPE_ICON[type]} size="20" decorative />
          </span>
          <span className={styles.thumbnail}>
            <OptimizedImage
              src={imageSrc ?? emptyImage}
              fallbackSrc={emptyImage}
              alt=""
              sizes="24px"
              className={styles.thumbnailImage}
            />
          </span>
        </div>
        <span className={styles.textGroup}>
          {props.type === 'recent' && (
            <span className={styles.caption}>
              {props.searchDayCount}일 전 검색한
            </span>
          )}
          <span className={styles.name}>{name}</span>
        </span>
      </div>
    </button>
  );
};

export default SearchItem;
