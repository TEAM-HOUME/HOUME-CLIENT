import {
  usePriceCompareJob,
  COMPARE_VIEW,
} from '@pages/home/hooks/usePriceCompareJob';

import ActionButton from '@components/button/actionButton/ActionButton';
import EmptyView from '@components/emptyView/EmptyView';
import InlineError from '@components/inlineError/InlineError';

import * as styles from './CompareTab.css';
import CompareResult from './result/CompareResult';
import CompareResultSkeleton from './result/CompareResultSkeleton';
import CompareSearch from './search/CompareSearch';

const CompareTab = () => {
  const { view, productUrl, errorMessage, isJobMissing, start, reset } =
    usePriceCompareJob();

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        {view === COMPARE_VIEW.SEARCH && (
          <CompareSearch
            initialUrl={productUrl ?? undefined}
            onSubmit={start}
          />
        )}

        {view === COMPARE_VIEW.LOADING && <CompareResultSkeleton />}

        {/* TODO: 서버 응답을 ProductCard 형태로 바꿔 result를 props로 넘기기. 지금 CompareResult는 목데이터 */}
        {view === COMPARE_VIEW.RESULT && (
          <CompareResult onSearchNewLink={reset} />
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
            message={
              errorMessage ??
              (isJobMissing ? '검색 결과가 만료되었어요' : '비교에 실패했어요')
            }
            onRetry={reset}
          />
        )}
      </div>
    </section>
  );
};

export default CompareTab;
