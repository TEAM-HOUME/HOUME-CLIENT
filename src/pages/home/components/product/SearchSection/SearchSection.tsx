import ProductCard from '@shared/components/v2/productCard/ProductCard';
import SearchBar from '@shared/components/v2/textField/SearchBar';

import Chip from '@components/v2/chip/Chip';

import Icon from '@/shared/components/v2/icon/Icon';

import * as styles from './SearchSection.css';

export type ProductFilterChipCategory = 'furniture' | 'price' | 'color';

export interface AppliedFilterChip {
  category: ProductFilterChipCategory;
  id: string;
  label: string;
}

interface SearchSectionProps {
  chipSelected: Record<ProductFilterChipCategory, boolean>;
  onFilterChipClick: (category: ProductFilterChipCategory) => void;
  appliedFilterChips: AppliedFilterChip[];
  onAppliedFilterChipRemove: (
    category: ProductFilterChipCategory,
    id: string
  ) => void;
}

const SearchSection = ({
  chipSelected,
  onFilterChipClick,
  appliedFilterChips,
  onAppliedFilterChipRemove,
}: SearchSectionProps) => {
  const mockProducts = [
    {
      id: 'p1',
      title: '모듈 패브릭 소파 3인',
      brand: 'HOUME',
      imageUrl: '',
      discountRate: 25,
      originalPrice: 532000,
      discountPrice: 399000,
      colorHexes: ['#E7EAEF', '#31373F', '#D4C4B0'],
      saveCount: 123,
    },
    {
      id: 'p2',
      title: '원목 라운드 테이블 1200',
      brand: 'TABLE LAB',
      imageUrl: '',
      discountRate: 15,
      originalPrice: 340000,
      discountPrice: 289000,
      colorHexes: ['#D4C4B0', '#5C4033'],
      saveCount: 76,
    },
    {
      id: 'p3',
      title: '메탈 프레임 책상 1400',
      brand: 'WORKFIT',
      imageUrl: '',
      discountRate: 30,
      originalPrice: 255000,
      discountPrice: 179000,
      colorHexes: ['#8E959E', '#1B1E22'],
      saveCount: 211,
    },
    {
      id: 'p4',
      title: '패브릭 암체어',
      brand: 'LIVING STUDIO',
      imageUrl: '',
      discountRate: 10,
      originalPrice: 143000,
      discountPrice: 129000,
      colorHexes: ['#FFFFFF', '#D4C4B0'],
      saveCount: 58,
    },
    {
      id: 'p5',
      title: '수납형 침대 프레임 Q',
      brand: 'SLEEPY',
      imageUrl: '',
      discountRate: 20,
      originalPrice: 624000,
      discountPrice: 499000,
      colorHexes: ['#F3F4F7', '#5C4033'],
      saveCount: 95,
    },
    {
      id: 'p6',
      title: '심플 거실장 1800',
      brand: 'MODERN CASA',
      imageUrl: '',
      discountRate: 35,
      originalPrice: 245000,
      discountPrice: 159000,
      colorHexes: ['#FFFFFF', '#8E959E', '#1B1E22'],
      saveCount: 142,
    },
    {
      id: 'p7',
      title: '스탠드 조명',
      brand: 'LIGHTER',
      imageUrl: '',
      discountRate: 5,
      originalPrice: 94000,
      discountPrice: 89000,
      colorHexes: ['#D4AF37', '#1B1E22'],
      saveCount: 34,
    },
    {
      id: 'p8',
      title: '러그 150x200',
      brand: 'RUGROOM',
      imageUrl: '',
      discountRate: 40,
      originalPrice: 99000,
      discountPrice: 59000,
      colorHexes: ['#D4C4B0', '#8E959E', '#7E57C2'],
      saveCount: 188,
    },
    {
      id: 'p9',
      title: '벽선반 2단',
      brand: 'WALLSET',
      imageUrl: '',
      discountRate: 18,
      originalPrice: 47000,
      discountPrice: 39000,
      colorHexes: ['#FFFFFF', '#5C4033'],
      saveCount: 12,
    },
    {
      id: 'p10',
      title: '데스크 체어',
      brand: 'SEATON',
      imageUrl: '',
      discountRate: 22,
      originalPrice: 127000,
      discountPrice: 99000,
      colorHexes: ['#31373F', '#8E959E'],
      saveCount: 67,
    },
    {
      id: 'p11',
      title: '침구 세트 (SS)',
      brand: 'BEDDING LAB',
      imageUrl: '',
      discountRate: 12,
      originalPrice: 90000,
      discountPrice: 79000,
      colorHexes: ['#FFFFFF', '#D4C4B0', '#EC407A'],
      saveCount: 51,
    },
    {
      id: 'p12',
      title: '수납 바스켓 세트',
      brand: 'BASKETRY',
      imageUrl: '',
      discountRate: 28,
      originalPrice: 68000,
      discountPrice: 49000,
      colorHexes: ['#D4C4B0', '#5C4033'],
      saveCount: 29,
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.searchHeader}>
        <div className={styles.searchBarContainer}>
          <SearchBar />
        </div>
        <div className={styles.filterList}>
          <div className={styles.filterScroll}>
            {appliedFilterChips.length > 0 ? (
              appliedFilterChips.map(({ category, id, label }) => (
                <Chip
                  key={`${category}-${id}`}
                  selected
                  onClick={() => onFilterChipClick(category)}
                  suffixIcon={<Icon name="Close" size="12" />}
                  suffixAriaLabel={`${label} 필터 해제`}
                  onSuffixClick={() => onAppliedFilterChipRemove(category, id)}
                >
                  {label}
                </Chip>
              ))
            ) : (
              <>
                <Chip
                  selected={chipSelected.furniture}
                  onClick={() => onFilterChipClick('furniture')}
                  suffixIcon={<Icon name="ChevronDown" size="12" />}
                >
                  카테고리
                </Chip>
                <Chip
                  selected={chipSelected.price}
                  onClick={() => onFilterChipClick('price')}
                  suffixIcon={<Icon name="ChevronDown" size="12" />}
                >
                  가격대
                </Chip>
                <Chip
                  selected={chipSelected.color}
                  onClick={() => onFilterChipClick('color')}
                  suffixIcon={<Icon name="ChevronDown" size="12" />}
                >
                  색상
                </Chip>
              </>
            )}
          </div>
        </div>
      </div>
      <div className={styles.productList}>
        {/* TODO: V2 공컴으로 변경 */}
        {mockProducts.map(
          ({
            id,
            title,
            brand,
            imageUrl,
            discountRate,
            originalPrice,
            discountPrice,
            colorHexes,
            saveCount,
          }) => (
            <ProductCard
              key={id}
              cardType="shopping"
              product={{
                title,
                brand,
                imageUrl,
                colorHexes,
              }}
              price={{
                original: originalPrice,
                discountRate,
                discount: discountPrice,
              }}
              save={{
                isSaved: false,
                onToggle: () => {},
                count: saveCount,
              }}
              link={{
                href: 'https://example.com',
              }}
            />
          )
        )}
      </div>
    </section>
  );
};

export default SearchSection;
