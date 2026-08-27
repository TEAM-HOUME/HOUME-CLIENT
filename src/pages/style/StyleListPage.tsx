import { useCallback } from 'react';

import { generatePath, useNavigate } from 'react-router-dom';

import {
  trackStyleListBackClick,
  trackStyleListCardClick,
} from '@pages/style/analytics/styleAnalytics';

import { ROUTES } from '@routes/paths';

import { GA_EVENTS } from '@analytics/events';
import { useAnalyticsPageView } from '@analytics/hooks/useAnalyticsPageView';
import { useScrollDepthTrack } from '@analytics/hooks/useScrollDepthTrack';
import { SCREEN_NAME } from '@analytics/screenNames';

import { useStyleListQuery } from '@apis/queries/useStyleListQuery';

import FallbackImage from '@assets/images/bannerFallback.svg';

import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';
import TitleNavBar from '@components/navBar/TitleNavBar';
import StyleCard from '@components/styleCard/StyleCard';

import * as styles from './StyleListPage.css';

const StyleListPage = () => {
  const navigate = useNavigate();

  const {
    data: stylesData = [],
    isFetching,
    isError,
    refetch,
  } = useStyleListQuery();

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
