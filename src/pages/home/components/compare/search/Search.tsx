import LinkInput from '@components/linkInput/LinkInput';
import SearchItem from '@components/searchItem/SearchItem';

import * as styles from './Search.css';

const MOCK_RECENT_ITEMS = [
  { name: '제품 이름', searchDayCount: 0 },
  { name: '제품 이름', searchDayCount: 0 },
  { name: '제품 이름', searchDayCount: 0 },
] as const;

const MOCK_POPULAR_ITEMS = [
  { name: '제품 이름' },
  { name: '제품 이름' },
] as const;

const Search = () => {
  const handleSubmit = (_value: string) => {};
  const handleItemClick = () => {};

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
                onClick={handleItemClick}
              />
            </li>
          ))}
          {MOCK_POPULAR_ITEMS.map((item, index) => (
            <li key={`popular-${index}`}>
              <SearchItem
                type="popular"
                name={item.name}
                onClick={handleItemClick}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Search;
