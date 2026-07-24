import { useCallback, useEffect, useId, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import {
  getBannerDetailPageViewParams,
  trackBannerDetailBackClick,
  trackBannerDetailChipClick,
  trackBannerDetailCtaClick,
  type BannerDetailContext,
} from '@pages/banner/analytics/bannerDetailAnalytics';
import { useBannerDetailQuery } from '@pages/home/apis/queries/useBannerDetailQuery';
import { useRecentFloorPlanQuery } from '@pages/imageSetup/v2/apis/queries/useRecentFloorPlanQuery';

import { ROUTES } from '@routes/paths';

import { ENTRY_ROUTE } from '@store/imageFlow/flowConfig';
import { useImageFlowStore } from '@store/useImageFlowStore';

import { GA_EVENTS } from '@shared/analytics/events';
import {
  useAnalyticsPageView,
  useScrollDepthTrack,
} from '@shared/analytics/hooks';
import { SCREEN_NAME } from '@shared/analytics/screenNames';
import { mapEntryRouteToLoginEntry } from '@shared/analytics/utils/loginEntryRoute';
import ActionButton from '@shared/components/v2/button/actionButton/ActionButton';
import Icon from '@shared/components/v2/icon/Icon';
import TitleNavBar from '@shared/components/v2/navBar/TitleNavBar';

import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';

import { useLoginGate } from '@hooks/useLoginGate';

import StyleCard from '@/shared/components/v2/styleCard/StyleCard';

import * as styles from './BannerDetailPage.css';

const BannerDetailPage = () => {
  const navigate = useNavigate();
  const { requireLogin } = useLoginGate();
  const { bannerId = '' } = useParams<{ bannerId: string }>();
  const questionId = useId();
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const parsedBannerId = Number(bannerId);
  const {
    data: bannerDetail,
    isPending,
    isError,
    refetch,
  } = useBannerDetailQuery(parsedBannerId);
  const { data: recentFloorPlanData, isFetched: isRecentFloorPlanFetched } =
    useRecentFloorPlanQuery();

  const isDataReady = !isPending && !isError && bannerDetail != null;
  const hasPreviousImage = recentFloorPlanData?.hasRecentImage === true;

  const bannerContext = useMemo(
    (): BannerDetailContext => ({
      bannerId: parsedBannerId,
      bannerName: bannerDetail?.bannerName,
    }),
    [bannerDetail?.bannerName, parsedBannerId]
  );

  const pageViewParams = useMemo(
    () =>
      getBannerDetailPageViewParams(bannerContext, {
        isNewUser: !hasPreviousImage,
      }),
    [bannerContext, hasPreviousImage]
  );

  useAnalyticsPageView(
    GA_EVENTS.bannerDetail.PAGE_VIEW,
    SCREEN_NAME.BANNER_DETAIL,
    pageViewParams,
    { enabled: isDataReady && isRecentFloorPlanFetched }
  );

  useScrollDepthTrack(
    GA_EVENTS.bannerDetail.PAGE_SCROLL,
    SCREEN_NAME.BANNER_DETAIL,
    {
      enabled: isDataReady,
    }
  );

  useEffect(() => {
    setSelectedAnswerId(null);
  }, [parsedBannerId]);

  const handleBackClick = useCallback(() => {
    trackBannerDetailBackClick({
      bannerId: parsedBannerId,
      bannerName: bannerDetail?.bannerName,
    });
    navigate(-1);
  }, [bannerDetail?.bannerName, navigate, parsedBannerId]);

  if (isPending) {
    return (
      <div className={styles.page}>
        <TitleNavBar
          title="원하는 공간 선택하기"
          backLabel="이전"
          onBackClick={handleBackClick}
        />
        <main className={styles.body}>
          <Loading />
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <TitleNavBar
          title="원하는 공간 선택하기"
          backLabel="이전"
          onBackClick={handleBackClick}
        />
        <main className={styles.body}>
          <InlineError onRetry={refetch} />
        </main>
      </div>
    );
  }

  if (!bannerDetail) {
    throw new Response('Banner detail not found', { status: 404 });
  }

  const handleCta = () => {
    if (selectedAnswerId === null) return;

    useImageFlowStore.getState().startFlow({
      route: 'HOME_BANNER',
      bannerId: parsedBannerId,
      answerId: selectedAnswerId,
    });

    const selectedAnswer = bannerDetail.answers?.find(
      (answer) => answer.id === selectedAnswerId
    );

    trackBannerDetailCtaClick(bannerContext, {
      answerId: selectedAnswerId,
      answerText: selectedAnswer?.text ?? '',
    });

    requireLogin(
      () => navigate(ROUTES.IMAGE_SETUP),
      mapEntryRouteToLoginEntry(ENTRY_ROUTE.HOME_BANNER)
    );
  };

  return (
    <div className={styles.page} key={bannerId}>
      <TitleNavBar
        title="원하는 공간 선택하기"
        backLabel="이전"
        onBackClick={handleBackClick}
      />
      <main className={styles.body}>
        <div className={styles.bannerContainer}>
          <StyleCard
            size="L"
            scaleOnPress={false}
            imageSrc={bannerDetail.bannerImageUrl ?? ''}
            title={bannerDetail.bannerName ?? '배너'}
          />
        </div>

        <div className={styles.questionContainer}>
          <h2 className={styles.question} id={questionId}>
            {bannerDetail.question ?? ''}
          </h2>
          <ul
            className={styles.optionList}
            role="radiogroup"
            aria-labelledby={questionId}
          >
            {(bannerDetail.answers ?? []).map((answer) => {
              if (answer.id == null) return null;
              const answerId = answer.id;
              const label = answer.text ?? '';
              const selected = selectedAnswerId === answerId;

              return (
                <li key={`${answerId}-${label}`}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={styles.optionRow}
                    onClick={() => {
                      setSelectedAnswerId(answerId);
                      trackBannerDetailChipClick(bannerContext, {
                        answerId,
                        answerText: label,
                      });
                    }}
                  >
                    <span className={styles.optionIcon} aria-hidden>
                      <Icon
                        name={selected ? 'RadioSelected' : 'RadioDefault'}
                        size="20"
                      />
                    </span>
                    <span className={styles.optionLabel}>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </main>

      <div className={styles.ctaBar}>
        <ActionButton
          variant="solid"
          color="primary"
          size="2XL"
          fullWidth
          disabled={selectedAnswerId === null}
          onClick={handleCta}
        >
          이 스타일로 우리 집 꾸미기
        </ActionButton>
      </div>
    </div>
  );
};

export default BannerDetailPage;
