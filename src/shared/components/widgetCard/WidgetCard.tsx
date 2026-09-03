import Icon from '@components/icon/Icon';
import SearchItem from '@components/searchItem/SearchItem';
import StatusBadge from '@components/statusBadge/StatusBadge';

import * as styles from './WidgetCard.css';

export interface WidgetCardProduct {
  presetId: number;
  name: string;
  imageSrc?: string;
  onClick: () => void;
}

interface WidgetCardProps {
  products: WidgetCardProduct[];
  onSearchClick: () => void;
}

const WidgetCard = ({ products, onSearchClick }: WidgetCardProps) => {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <StatusBadge label="BETA" />
          <h2 className={styles.title}>비슷한 상품 비교하기</h2>
        </div>
        <p className={styles.subtitle}>
          원하는 상품을 링크로 검색하고, 비슷한 상품을 추천받아요
        </p>
      </header>
      <div className={styles.contents}>
        <button
          type="button"
          className={styles.fakeLinkInput}
          onClick={onSearchClick}
        >
          <span className={styles.textLabel}>상품 링크로 직접 검색하기</span>
          <Icon name="ArrowUpFillGrad" size="32" decorative />
        </button>
        {products.length > 0 && (
          <div className={styles.itemRow}>
            {products.map((product) => (
              <SearchItem
                key={product.presetId}
                type="popular"
                name={product.name}
                imageSrc={product.imageSrc}
                onClick={product.onClick}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WidgetCard;
