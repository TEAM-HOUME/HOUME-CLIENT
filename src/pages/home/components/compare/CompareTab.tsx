import {
  usePriceCompareJob,
  COMPARE_VIEW,
} from '@pages/home/hooks/usePriceCompareJob';

import CompareFallback from './CompareFallback';
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
            onSubmit={(url: string) => start(url)}
          />
        )}

        {view === COMPARE_VIEW.LOADING && <CompareResultSkeleton />}

        {/* TODO: 서버 응답을 ProductCard 형태로 바꿔 result를 props로 넘기기. 지금 CompareResult는 목데이터 */}
        {view === COMPARE_VIEW.RESULT && (
          <CompareResult onSearchNewLink={reset} />
        )}

        {view === COMPARE_VIEW.EMPTY && (
          <CompareFallback
            title="찾는 상품이 없어요"
            description="다른 URL로 검색해주세요"
            actionLabel="새로운 링크 검색하기"
            onAction={reset}
          />
        )}

        {view === COMPARE_VIEW.ERROR && (
          <CompareFallback
            title={
              isJobMissing ? '검색 결과가 만료되었어요' : '비교에 실패했어요'
            }
            description={errorMessage ?? '잠시 후 다시 시도해주세요'}
            actionLabel="새로운 링크 검색하기"
            onAction={reset}
          />
        )}
      </div>
    </section>
  );
};

export default CompareTab;
