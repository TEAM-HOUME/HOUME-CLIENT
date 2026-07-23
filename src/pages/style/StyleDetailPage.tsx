import { useCallback, useMemo } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import {
  getStyleDetailPageViewParams,
  trackStyleDetailBackClick,
  trackStyleDetailCtaClick,
} from '@pages/style/analytics/styleAnalytics';

import { ROUTES } from '@routes/paths';

import { ENTRY_ROUTE } from '@store/imageFlow/flowConfig';
import { useImageFlowStore } from '@store/useImageFlowStore';
import { useSavedItemsStore } from '@store/useSavedItemsStore';

import { GA_EVENTS } from '@shared/analytics/events';
import {
  useAnalyticsPageView,
  useScrollDepthTrack,
} from '@shared/analytics/hooks';
import { LOGIN_ENTRY_ROUTE } from '@shared/analytics/params/gate';
import { SCREEN_NAME } from '@shared/analytics/screenNames';
import { mapEntryRouteToLoginEntry } from '@shared/analytics/utils/loginEntryRoute';

import { useJjymMutation } from '@apis/mutations/useJjymMutation';

import FallbackImage from '@assets/v2/images/bannerFallback.svg';

import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';
import ActionButton from '@components/v2/button/actionButton/ActionButton';
import TitleNavBar from '@components/v2/navBar/TitleNavBar';
import ListCardProduct from '@components/v2/productCard/ListProductCard';
import StyleCard from '@components/v2/styleCard/StyleCard';

import { useLoginGate } from '@hooks/useLoginGate';

import { normalizeColorHexes } from '@utils/normalizeColorHexes';

import { useGetStyleDetailQuery } from './apis/useGetStyleDetailQuery';
import * as styles from './StyleDetailPage.css';

const StyleDetailPage = () => {
  const { styleId } = useParams<{ styleId: string }>();
  const navigate = useNavigate();
  const { requireLogin } = useLoginGate();
  const parsedStyleId = styleId ? Number(styleId) : NaN;

  const savedProductIds = useSavedItemsStore((state) => state.savedProductIds);

  const {
    data: styleDetailData,
    isLoading,
    isError,
    refetch,
  } = useGetStyleDetailQuery(parsedStyleId);

  const isDataReady = !isLoading && !isError && styleDetailData != null;

  const styleContext = useMemo(
    () => ({
      styleId: parsedStyleId,
      styleName: styleDetailData?.styleName,
    }),
    [parsedStyleId, styleDetailData?.styleName]
  );

  const pageViewParams = useMemo(
    () => getStyleDetailPageViewParams(styleContext),
    [styleContext]
  );

  useAnalyticsPageView(
    GA_EVENTS.styleDetail.PAGE_VIEW,
    SCREEN_NAME.STYLE_DETAIL,
    pageViewParams,
    { enabled: isDataReady }
  );

  useScrollDepthTrack(
    GA_EVENTS.styleDetail.PAGE_SCROLL,
    SCREEN_NAME.STYLE_DETAIL,
    {
      enabled: isDataReady,
    }
  );

  const { mutate: toggleJjym } = useJjymMutation({
    savedToastType: 'move',
    loginEntryRoute: LOGIN_ENTRY_ROUTE.PRODUCT_LIST_SAVE,
    onSavedAction: () => {
      navigate(ROUTES.MYPAGE, { state: { activeTab: 'savedItems' } });
    },
  });

  const handleToggleSave = (id: number, productName?: string) => {
    toggleJjym(id, { productName });
  };

  const handleBackClick = useCallback(() => {
    trackStyleDetailBackClick();
    navigate(-1);
  }, [navigate]);

  const handleCta = () => {
    if (Number.isNaN(parsedStyleId)) return;

    useImageFlowStore.getState().startFlow({
      route: 'STYLE_RESTYLE',
      styleId: parsedStyleId,
    });

    trackStyleDetailCtaClick(styleContext);

    requireLogin(
      () => navigate(ROUTES.IMAGE_SETUP),
      mapEntryRouteToLoginEntry(ENTRY_ROUTE.STYLE_RESTYLE)
    );
  };

  return (
    <div className={styles.wrapper}>
      <TitleNavBar
        title="스타일 상세 보기"
        backLabel="이전"
        onBackClick={handleBackClick}
      />
      <div className={styles.container}>
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <InlineError
            onRetry={refetch}
            message="다른 스타일을 불러올 수 없습니다"
          />
        ) : (
          <>
            <section className={styles.styleCardInfo}>
              <StyleCard
                size="L"
                title={styleDetailData?.styleName}
                largeContents={{
                  title: styleDetailData?.styleName || '',
                  description: styleDetailData?.styleDescription || '',
                }}
                imageSrc={styleDetailData?.styleImageUrl || FallbackImage}
                imageLoading="eager"
              />
            </section>
            <section className={styles.productList}>
              <span className={styles.sectionTitle}>사용된 가구</span>
              <div className={styles.products}>
                {styleDetailData?.products?.map((item) => (
                  <ListCardProduct
                    key={item.id}
                    product={{
                      title: item.name || '',
                      imageUrl: item.imageUrl || FallbackImage,
                      colorHexes: normalizeColorHexes(item.colors || []),
                    }}
                    price={{
                      original: item.originalPrice,
                      discount: item.finalPrice,
                      discountRate: item.discountRate,
                    }}
                    save={{
                      isSaved:
                        item.id !== undefined
                          ? savedProductIds.has(item.id) ||
                            item.isLiked === true
                          : false,
                      onToggle: () => {
                        if (item.id !== undefined) {
                          handleToggleSave(item.id, item.name);
                        }
                      },
                    }}
                    link={{
                      href: item.linkUrl || '',
                    }}
                    enableWholeCardLink={true}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
      <div className={styles.btnWrapper}>
        <ActionButton onClick={handleCta} fullWidth>
          이 스타일로 우리 집 꾸미기
        </ActionButton>
      </div>
    </div>
  );
};

export default StyleDetailPage;
