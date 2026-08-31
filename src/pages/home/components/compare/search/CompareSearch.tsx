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
  /** 입력창에서 링크를 넣고 확인을 누르면 호출된다 */
  onSubmit: (url: string) => void;
  /** 히스토리 클릭 시 주소에 productUrl을 넣고 입력창을 채운다 */
  onSelectUrl: (url: string) => void;
  /** 프리셋 클릭 시 고정 결과 조회를 시작한다 */
  onSelectPreset: (presetId: number) => void;
}

const CompareSearch = ({
  initialUrl = '',
  onSubmit,
  onSelectUrl,
  onSelectPreset,
}: CompareSearchProps) => {
  const [url, setUrl] = useState(initialUrl);
  const isLoggedIn = !!useUserStore((state) => state.accessToken);

  const { data: historyData } = useCompareHistoryQuery(isLoggedIn);
  const { data: presetsData } = useComparePresetsQuery();

  // 비로그인이면 캐시에 이전 로그인 사용자의 히스토리가 남아있어도 절대 안 보여준다.
  // useCompareHistoryQuery의 캐시 삭제는 정리용일 뿐이라 화면 정확성은 이 가드가 최종 보장한다
  const historyItems = isLoggedIn ? (historyData?.items ?? []) : [];
  const presets = presetsData?.presets ?? [];

  const handleSubmit = (value: string) => onSubmit(value);
  const handleHistoryClick = (sourceUrl: string) => onSelectUrl(sourceUrl);
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
            <li key={item.sourceUrl}>
              <SearchItem
                type="recent"
                name={item.title}
                imageSrc={item.thumbnailUrl ?? undefined}
                searchDayCount={getSearchDayCount(item.createdAt)}
                onClick={() => handleHistoryClick(item.sourceUrl)}
              />
            </li>
          ))}
          {presets.map((preset) => (
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
