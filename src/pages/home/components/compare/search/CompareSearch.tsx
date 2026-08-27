import LinkInput from '@components/linkInput/LinkInput';
import SearchItem from '@components/searchItem/SearchItem';

import * as styles from './CompareSearch.css';

const MOCK_RECENT_ITEMS = [
  { name: '제품 이름', searchDayCount: 0 },
  { name: '제품 이름', searchDayCount: 0 },
  { name: '제품 이름', searchDayCount: 0 },
] as const;

// GET /api/v1/price-compare/presets 응답 data 형태
const MOCK_PRICE_COMPARE_PRESETS = {
  presets: [
    {
      presetId: 1,
      thumbnailUrl: 'https://cdn.ohou.se/thumb/999999.jpg',
      title: '룬드 무헤드 수납 침대 프레임 SS Q 슈퍼싱글 퀸',
    },
    {
      presetId: 2,
      thumbnailUrl: null,
      title: '제품 이름',
    },
  ],
} as const;

const CompareSearch = () => {
  const handleSubmit = (_value: string) => {};
  const handleRecentClick = () => {};
  const handlePresetClick = (_presetId: number) => {};

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          마음에 든 상품 링크를 붙여넣으면 <br /> 비슷한 상품을 찾아드려요
        </h2>
        <p className={styles.description}>설명을 입력하는 공간이에요.</p>
      </header>
      <div className={styles.contents}>
        <LinkInput onSubmit={handleSubmit} />
        <ul className={styles.itemList}>
          {MOCK_RECENT_ITEMS.map((item, index) => (
            <li key={`recent-${index}`}>
              <SearchItem
                type="recent"
                name={item.name}
                searchDayCount={item.searchDayCount}
                onClick={handleRecentClick}
              />
            </li>
          ))}
          {MOCK_PRICE_COMPARE_PRESETS.presets.map((preset) => (
            <li key={preset.presetId}>
              <SearchItem
                type="popular"
                name={preset.title}
                imageSrc={preset.thumbnailUrl ?? undefined}
                onClick={() => handlePresetClick(preset.presetId)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CompareSearch;
