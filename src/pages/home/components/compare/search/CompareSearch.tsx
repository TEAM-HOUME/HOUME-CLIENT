import { useState } from 'react';

import { useCompareHistoryQuery } from '@pages/home/apis/queries/useCompareHistoryQuery';
import { useComparePresetsQuery } from '@pages/home/apis/queries/useComparePresetsQuery';

import { useUserStore } from '@store/useUserStore';

import LinkInput from '@components/linkInput/LinkInput';
import SearchItem from '@components/searchItem/SearchItem';

import * as styles from './CompareSearch.css';
import { getSearchDayCount } from '../utils/getSearchDayCount';

interface CompareSearchProps {
  /**
   * 입력창에 처음 채워둘 상품 URL.
   * 딥링크로 진입했거나 로그인 게이트를 거쳐 돌아온 경우 주소의 productUrl이 들어온다.
   */
  initialUrl?: string;
  /** 입력창 확인 또는 최근 비교 히스토리 클릭 시 비교 job을 시작한다 */
  onSubmit: (url: string) => void;
  /** 프리셋 클릭 시 고정 결과 조회를 시작한다 */
  onSelectPreset: (presetId: number) => void;
}

const CompareSearch = ({
  initialUrl = '',
  onSubmit,
  onSelectPreset,
}: CompareSearchProps) => {
  const [url, setUrl] = useState(initialUrl);
  const isLoggedIn = !!useUserStore((state) => state.accessToken);

  const { data: historyData } = useCompareHistoryQuery(isLoggedIn);
  const { data: presetsData } = useComparePresetsQuery();

  // 비로그인이면 캐시에 이전 데이터가 있어도 목록을 그리지 않는다.
  const historyItems = isLoggedIn ? (historyData?.items ?? []) : [];
  const presets = presetsData?.presets ?? [];

  const handleSubmit = (value: string) => onSubmit(value);
  const handlePresetClick = (presetId: number) => onSelectPreset(presetId);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          마음에 든 상품 링크를 붙여넣으면 <br /> 비슷한 상품을 찾아드려요
        </h2>
        <p className={styles.description}>설명을 입력하는 공간이에요.</p>
      </header>
      <div className={styles.contents}>
        <LinkInput value={url} onChange={setUrl} onSubmit={handleSubmit} />
        <ul className={styles.itemList}>
          {historyItems.map((item) => (
            <li key={item.sourceUrl} className={styles.item}>
              <SearchItem
                type="recent"
                name={item.title}
                imageSrc={item.thumbnailUrl ?? undefined}
                searchDayCount={getSearchDayCount(item.createdAt)}
                onClick={() => onSubmit(item.sourceUrl)}
              />
            </li>
          ))}
          {presets.map((preset) => (
            <li key={preset.presetId} className={styles.item}>
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
