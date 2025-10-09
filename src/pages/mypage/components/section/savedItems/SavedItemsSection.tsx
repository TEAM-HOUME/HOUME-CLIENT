import { useState } from 'react';

import CardProduct from '@/shared/components/card/cardProduct/CardProduct';

import * as styles from './SavedItemsSection.css';
import EmptyStateSection from '../emptyState/EmptyStateSection';

// TODO: API 연동 시 실제 타입으로 변경
interface SavedItem {
  id: number;
  title: string;
  brand?: string;
  imageUrl?: string;
  linkUrl?: string;
  isSaved: boolean;
}

const SavedItemsSection = () => {
  // TODO: API 연동 시 실제 데이터로 교체
  const [savedItems, setSavedItems] = useState<SavedItem[]>([
    {
      id: 1,
      title: '제품 이름은 최대 2줄까지',
      brand: '브랜드명',
      isSaved: true,
      linkUrl: 'https://example.com',
    },
    {
      id: 2,
      title: '제품 이름은 최대 2줄까지',
      brand: '브랜드명',
      isSaved: true,
      linkUrl: 'https://example.com',
    },
    {
      id: 3,
      title: '제품 이름은 최대 2줄까지',
      brand: '브랜드명',
      isSaved: true,
      linkUrl: 'https://example.com',
    },
    {
      id: 4,
      title: '제품 이름은 최대 2줄까지',
      brand: '브랜드명',
      isSaved: true,
      linkUrl: 'https://example.com',
    },
    {
      id: 5,
      title: '제품 이름은 최대 2줄까지',
      brand: '브랜드명',
      isSaved: true,
      linkUrl: 'https://example.com',
    },
    {
      id: 6,
      title: '제품 이름은 최대 2줄까지',
      brand: '브랜드명',
      isSaved: true,
      linkUrl: 'https://example.com',
    },
    {
      id: 7,
      title: '제품 이름은 최대 2줄까지',
      brand: '브랜드명',
      isSaved: true,
      linkUrl: 'https://example.com',
    },
    {
      id: 8,
      title: '제품 이름은 최대 2줄까지',
      brand: '브랜드명',
      isSaved: true,
      linkUrl: 'https://example.com',
    },
    {
      id: 9,
      title: '제품 이름은 최대 2줄까지',
      brand: '브랜드명',
      isSaved: true,
      linkUrl: 'https://example.com',
    },
  ]);

  const handleToggleSave = (id: number) => {
    setSavedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSaved: !item.isSaved } : item
      )
    );
  };

  // 저장된 아이템이 없을 때
  if (savedItems.length === 0) {
    return <EmptyStateSection type="savedItems" />;
  }

  return (
    <section className={styles.container}>
      <div className={styles.gridContainer}>
        {savedItems.map((item) => (
          <CardProduct
            key={item.id}
            size="small"
            title={item.title}
            brand={item.brand}
            isSaved={item.isSaved}
            onToggleSave={() => handleToggleSave(item.id)}
            linkHref={item.linkUrl}
          />
        ))}
      </div>
    </section>
  );
};

export default SavedItemsSection;
