import { useCallback } from 'react';

import { generatePath, useNavigate } from 'react-router-dom';

import {
  trackStyleListBackClick,
  trackStyleListCardClick,
} from '@pages/style/analytics/styleAnalytics';

import { GA_EVENTS } from '@shared/analytics/events';
import {
  useAnalyticsPageView,
  useScrollDepthTrack,
} from '@shared/analytics/hooks';
import { SCREEN_NAME } from '@shared/analytics/screenNames';

import { useGetStyleListQuery } from '@apis/queries/useGetStyleQuery';

import FallbackImage from '@assets/v2/images/bannerFallback.svg';

import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';
import TitleNavBar from '@components/navBar/TitleNavBar';
import StyleCard from '@components/styleCard/StyleCard';

import { ROUTES } from '@/routes/paths';

import * as styles from './StyleListPage.css';

const StyleListPage = () => {
  const navigate = useNavigate();

  const {
    data: stylesData = [],
    isFetching,
    isError,
    refetch,
  } = useGetStyleListQuery();

  const isDataReady = !isFetching && !isError;

  useAnalyticsPageView(
    GA_EVENTS.styleList.PAGE_VIEW,
    SCREEN_NAME.STYLE_LIST,
    undefined,
    {
      enabled: isDataReady,
    }
  );

  useScrollDepthTrack(GA_EVENTS.styleList.PAGE_SCROLL, SCREEN_NAME.STYLE_LIST, {
    enabled: isDataReady,
  });

  const handleBackClick = useCallback(() => {
    trackStyleListBackClick();
    navigate(-1);
  }, [navigate]);

  const handleStyleClick = useCallback(
    (styleId: number, styleName?: string) => {
      trackStyleListCardClick({ styleId, styleName });
      navigate(generatePath(ROUTES.STYLE_DETAIL, { styleId: String(styleId) }));
    },
    [navigate]
  );

  return (
    <section className={styles.wrapper}>
      <TitleNavBar
        title="스타일 전체 보기"
        backLabel="이전"
        onBackClick={handleBackClick}
      />

      <div className={styles.cardList}>
        {isFetching ? (
          <Loading />
        ) : isError ? (
          <InlineError
            onRetry={refetch}
            message="스타일 전체 보기를 불러올 수 없습니다"
          />
        ) : (
          <>
            {stylesData.map((style) => (
              <StyleCard
                size="L"
                key={style.id}
                imageSrc={style.imageUrl || FallbackImage}
                title={style.name}
                onClick={() => handleStyleClick(style.id, style.name)}
                imageLoading="eager"
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default StyleListPage;
