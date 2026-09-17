import { useCompareTab, COMPARE_VIEW } from '@pages/home/hooks/useCompareTab';

import ActionButton from '@components/button/actionButton/ActionButton';
import EmptyView from '@components/emptyView/EmptyView';
import InlineError from '@components/inlineError/InlineError';

import * as styles from './CompareTab.css';
import CompareResult from './result/CompareResult';
import CompareResultSkeleton from './result/CompareResultSkeleton';
import CompareSearch from './search/CompareSearch';

const CompareTab = () => {
  const {
    view,
    productUrl,
    errorMessage,
    start,
    selectPreset,
    resultViewModel,
    searchedProduct,
    reset,
  } = useCompareTab();

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        {view === COMPARE_VIEW.SEARCH && (
          /* key: 뒤로가기 등으로 주소의 productUrl이 바뀌면 입력창도 그 값으로 다시 시작한다 */
          <CompareSearch
            key={productUrl ?? ''}
            initialUrl={productUrl ?? undefined}
            onSubmit={start}
            onSelectPreset={selectPreset}
          />
        )}

        {/* 로딩 중에도 "검색한 상품" 카드는 값이 오는 즉시 그리고, "비슷한 상품" 영역만 스켈레톤을 유지한다 */}
        {view === COMPARE_VIEW.LOADING && (
          <CompareResultSkeleton
            searchedProduct={searchedProduct}
            onSearchNewLink={reset}
          />
        )}

        {view === COMPARE_VIEW.RESULT && resultViewModel && (
          <CompareResult viewModel={resultViewModel} onSearchNewLink={reset} />
        )}

        {view === COMPARE_VIEW.EMPTY && (
          <div className={styles.fallback}>
            <EmptyView
              title="찾는 상품이 없어요"
              description="다른 URL로 검색해주세요"
            />
            <ActionButton variant="outlined" size="S" onClick={reset}>
              새로운 링크 검색하기
            </ActionButton>
          </div>
        )}

        {view === COMPARE_VIEW.ERROR && (
          <InlineError
            message={errorMessage ?? '비교에 실패했어요'}
            onRetry={reset}
          />
        )}
      </div>
    </section>
  );
};

export default CompareTab;
