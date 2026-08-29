import { useUserStore } from '@store/useUserStore';

import LinkInput from '@components/linkInput/LinkInput';
import SearchItem from '@components/searchItem/SearchItem';

import * as styles from './CompareSearch.css';
import { getSearchDayCount } from '../utils/getSearchDayCount';

// GET /api/v1/price-compare/jobs/history 응답 data.items[] 형태 (limit=3)
const PRICE_COMPARE_HISTORY_LIMIT = 3;

const MOCK_PRICE_COMPARE_HISTORY = [
  {
    sourceUrl: 'https://store.ohou.se/goods/3603649',
    thumbnailUrl:
      'https://prs.ohousecdn.com/apne2/any/uploads/productions/v1-393443018530944.jpg',
    title: '노엘 반자동 리프트업 통수납 침대프레임 SS/Q',
    price: 149_000,
    currency: 'KRW',
    createdAt: '2026-08-23T14:02:11+09:00',
  },
  {
    sourceUrl: 'https://store.ohou.se/goods/2981274',
    thumbnailUrl:
      'https://prs.ohousecdn.com/apne2/any/uploads/productions/v1-372918822210048.jpg',
    title: '플렌토 속 깊은 5단 서랍장 800',
    price: null,
    currency: null,
    createdAt: '2026-08-20T09:15:44+09:00',
  },
  {
    sourceUrl: 'https://store.ohou.se/goods/1234567',
    thumbnailUrl:
      'https://prs.ohousecdn.com/apne2/any/uploads/productions/v1-372918822210048.jpg',
    title: '룬드 무헤드 수납 침대 프레임 SS Q 슈퍼싱글 퀸',
    price: 89_000,
    currency: 'KRW',
    createdAt: '2026-08-18T10:00:00+09:00',
  },
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
  const isLoggedIn = !!useUserStore((state) => state.accessToken);

  // TODO: API 연동 시 GET /api/v1/price-compare/jobs/history?limit=3
  const historyItems = isLoggedIn
    ? MOCK_PRICE_COMPARE_HISTORY.slice(0, PRICE_COMPARE_HISTORY_LIMIT)
    : [];

  const handleSubmit = (_value: string) => {};
  const handleHistoryClick = (_sourceUrl: string) => {
    // TODO: POST /jobs { url: sourceUrl } — 로그인 게이트는 별도 처리
  };
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
          {historyItems.map((item) => (
            <li key={item.sourceUrl}>
              <SearchItem
                type="recent"
                name={item.title}
                imageSrc={item.thumbnailUrl}
                searchDayCount={getSearchDayCount(item.createdAt)}
                onClick={() => handleHistoryClick(item.sourceUrl)}
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
