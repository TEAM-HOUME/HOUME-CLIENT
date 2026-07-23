import { useEffect } from 'react';

import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { trackResultListBtnBackClick } from '@pages/generate/analytics/resultListAnalytics';
import { trackResultRecBtnBackClick } from '@pages/generate/analytics/resultRecAnalytics';
import { useImageMetaQuery } from '@pages/generate/v2/apis/queries/useImageMetaQuery';

import { ROUTES } from '@routes/paths';

import { isCurationViewType, RESULT_TYPE } from '@store/imageFlow/flowConfig';

import { GA_EVENTS } from '@shared/analytics/events';
import {
  useAnalyticsPageView,
  useScrollDepthTrack,
} from '@shared/analytics/hooks';
import { IMAGE_ENTRY_ROUTE } from '@shared/analytics/params/gate';
import { SCREEN_NAME } from '@shared/analytics/screenNames';
import { getEntryRoute } from '@shared/analytics/utils/imageEntryRoute';
import { buildResultRecPageViewParams } from '@shared/analytics/utils/imageFlow';
import { clarityEvent } from '@shared/config/clarity';

import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';
import TitleNavBar from '@components/v2/navBar/TitleNavBar';

import { useExitBlocker } from '@hooks/useExitBlocker';

import CurationResult from './components/curation/CurationResult';
import ListResult from './components/list/ListResult';
import * as styles from './ResultPage.css';

import type { ResultImageMeta } from './types';

const ResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // URL ?houseId= 파싱 (NaN/소수점/음수는 클라이언트에서 차단, 그 외 잘못된 id는 백엔드 응답 에러로 처리)
  const rawHouseId = searchParams.get('houseId')?.trim() ?? '';
  const candidate = Number(rawHouseId);
  const parsedImageId =
    rawHouseId !== '' && Number.isInteger(candidate) && candidate > 0
      ? candidate
      : null;

  // URL ?viewType -> 추천형/목록형 분기 기준 + 목록형 내 '상품 다시 선택하기' 버튼 분기 기준
  const rawViewType = searchParams.get('viewType');
  const isListView = !isCurationViewType(rawViewType);
  const isProductView = rawViewType === RESULT_TYPE.PRODUCT;

  // LoadingPage/마이페이지에서 navigate state로 전달한 데이터 (새로고침 시 손실 → /meta로 fallback)
  // imageUrl/isMirror는 /meta 응답에 포함되므로 state 손실 시 자동 보충 가능
  // from은 진입 경로 식별용 — 'loading'인 경우 뒤로가기를 HOME으로 강제 리다이렉트
  const locationState = location.state as {
    imageUrl?: string;
    isMirror?: boolean;
    from?: 'loading' | 'mypage';
  } | null;
  const stateImageUrl = locationState?.imageUrl;
  const stateIsMirror = locationState?.isMirror;
  const isFromLoading = locationState?.from === 'loading';
  const isFromMypage = locationState?.from === 'mypage';

  useAnalyticsPageView(
    GA_EVENTS.resultRec.PAGE_VIEW,
    SCREEN_NAME.RESULT_REC,
    {
      gen_img_id: parsedImageId ?? 0,
      ...(isFromMypage
        ? { image_entry_route: IMAGE_ENTRY_ROUTE.MYPAGE }
        : isFromLoading && {
            ...buildResultRecPageViewParams(parsedImageId ?? 0),
            image_entry_route: getEntryRoute(),
          }),
    },
    {
      enabled: parsedImageId !== null && !isListView,
      refireKey: parsedImageId ?? undefined,
    }
  );

  useScrollDepthTrack(GA_EVENTS.resultRec.PAGE_SCROLL, SCREEN_NAME.RESULT_REC, {
    enabled: parsedImageId !== null && !isListView,
  });

  useScrollDepthTrack(
    GA_EVENTS.resultList.PAGE_SCROLL,
    SCREEN_NAME.RESULT_LIST,
    {
      enabled: parsedImageId !== null && isListView,
    }
  );

  // 이미지 생성 완료(로딩→결과 진입) 시 Clarity 전환 이벤트 1회 — Smart Events/Funnels용
  // 마이페이지·연관 이미지 재진입(isFromLoading=false)에선 미발화
  useEffect(() => {
    if (isFromLoading && parsedImageId !== null) {
      clarityEvent('image_generated');
    }
  }, [isFromLoading, parsedImageId]);

  const handleBackClick = () => {
    if (isListView) {
      trackResultListBtnBackClick();
    } else {
      trackResultRecBtnBackClick();
    }
    navigate(-1);
  };

  // 뒤로가기 가드 — LoadingPage->ResultPage이고, 사용자 액션이 POP(뒤로가기)일 때만 useExitBlocker 훅이 실행됨
  // - LoadingPage->ResultPage에서 뒤로가기 시 HOME으로 redirect (이미지 생성 플로우로 재진입 방지)
  // - MyPage->ResultPage시에는 enabled=false, 따라서 history(-1)
  // - navigation 액션이 PUSH/REPLACE(자식 컴포넌트에서 다른 페이지로 이동, "다시 만들기"로 상품 탭 이동 등)일 때는 정상적으로 navigate
  useExitBlocker({
    enabled: isFromLoading,
    shouldBlockNavigation: ({ historyAction }) => historyAction === 'POP',
    onBlocked: ({ reset }) => {
      reset();
      // 브라우저 히스토리 꼬임 방지 - 복원 popstate가 처리된 다음 task에서 replace해야 Result 엔트리를 정확히 대체한다
      setTimeout(() => navigate(ROUTES.HOME, { replace: true }), 0);
    },
  });

  // state.imageUrl이 비어있는 경우(null/빈 문자열)도 누락으로 간주 -> /meta로 fallback
  const hasStateImageUrl =
    typeof stateImageUrl === 'string' && stateImageUrl.trim() !== '';
  const hasStateIsMirror = typeof stateIsMirror === 'boolean';

  // /meta API 호출 — state에 imageUrl/isMirror가 모두 유효하게 들어왔으면 호출 불필요
  // 둘 중 하나라도 누락되었거나 새로고침으로 state가 손실된 경우에만 fallback으로 호출
  const needsMetaFallback = !hasStateImageUrl || !hasStateIsMirror;
  const {
    data: meta,
    isPending: isMetaPending,
    isError: isMetaError,
  } = useImageMetaQuery(parsedImageId ?? 0, {
    enabled: parsedImageId !== null && needsMetaFallback,
  });

  // 잘못된 houseId → HOME으로
  if (parsedImageId === null) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // 유효한 state 값 우선, 부재 시 meta 응답으로 보충
  const resolvedImageUrl = hasStateImageUrl ? stateImageUrl : meta?.imageUrl;
  const resolvedIsMirror = hasStateIsMirror
    ? stateIsMirror
    : (meta?.isMirror ?? false);

  // state도 없고 meta도 아직 로딩 중 → 로딩 UI
  if (!resolvedImageUrl && isMetaPending) {
    return (
      <main className={styles.pageLayout}>
        <TitleNavBar
          background="transparent"
          placement="overContent"
          onBackClick={handleBackClick}
        />
        <Loading />
      </main>
    );
  }

  // state도 없고 meta도 실패 → 에러 UI
  if (!resolvedImageUrl && isMetaError) {
    return (
      <main className={styles.pageLayout}>
        <TitleNavBar
          background="transparent"
          placement="overContent"
          onBackClick={handleBackClick}
        />
        <InlineError message="이미지를 불러올 수 없습니다" />
      </main>
    );
  }

  // 자식 컴포넌트에 전달할 이미지 메타 (자식들은 imageId로 자체 API 호출하여 큐레이션/리스트 데이터 fetch)
  const image: ResultImageMeta = {
    imageId: parsedImageId,
    imageUrl: resolvedImageUrl ?? '',
    isMirror: resolvedIsMirror,
  };

  return (
    <main className={styles.pageLayout}>
      <TitleNavBar
        background="gradient"
        placement="overContent"
        onBackClick={handleBackClick}
      />
      <div className={styles.content}>
        <div className={styles.resultBody}>
          {isListView ? (
            <ListResult image={image} isProductView={isProductView} />
          ) : (
            <CurationResult images={[image]} />
          )}
        </div>
      </div>
    </main>
  );
};

export default ResultPage;
