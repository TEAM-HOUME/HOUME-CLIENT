import { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import { useUserStore } from '@store/useUserStore';

import { getEntryRoute } from '@shared/analytics/utils/imageEntryRoute';
import { getLoginStatus } from '@shared/analytics/utils/loginStatus';
import { resolveScreenName } from '@shared/analytics/utils/screenName';
import { setReportTag } from '@shared/monitoring/report';
import { AB_TEST_STORAGE_KEY, isABTestGroup } from '@shared/types/abTest';

/**
 * GA4·Clarity가 쓰는 세그먼트 축을 Sentry 태그로 미러링하는 훅
 *
 * RootLayout에서 1회 마운트 — 이슈를 화면·진입경로 단위로 필터링할 수 있게 한다.
 * 세 도구가 같은 축을 쓰므로 "Clarity에서 본 세션"과 "Sentry에서 본 에러"를 같은 기준으로 맞춰볼 수 있다.
 *
 * +) 개인 식별(setUser)은 하지 않는다 — [[useClaritySync]]와 동일한 비식별 원칙 유지
 *    (개인정보처리방침에 내부 식별자 저장이 가능한지 확인되면 별도로 논의)
 */
export const useSentrySync = (): void => {
  const location = useLocation();
  const accessToken = useUserStore((state) => state.accessToken);

  // 화면 단위 — SPA 탭(`?tab=product`)이나 퍼널 스텝(`?image-generation-funnel.step=`)처럼
  // pathname이 안 바뀌는 화면을 Sentry 이슈에서 구분하는 핵심 태그.
  // Sentry 기본 transaction은 pathname만 보므로 이 태그 없이는 구분이 불가능하다.
  useEffect(() => {
    setReportTag(
      'screen_name',
      resolveScreenName(`${location.pathname}${location.search}`)
    );
  }, [location.pathname, location.search]);

  // 로그인 상태
  useEffect(() => {
    setReportTag('login_status', getLoginStatus());
  }, [accessToken]);

  // A/B variant — 이미 배정된 값을 storage에서 수동 read만 (여기서 배정을 트리거하지 않음)
  // useABTest()를 호출하면 userId 로딩 전(로그인 직후 등) 조기 랜덤 배정이 캐시되어
  // 이후 userId 기반 결정적 배정을 영구히 덮어쓰므로, 관측용 훅에서는 직접 읽어 태깅만 수행
  useEffect(() => {
    try {
      const cached = localStorage.getItem(AB_TEST_STORAGE_KEY);
      if (cached && isABTestGroup(cached)) {
        setReportTag('ab_variant', cached);
      }
    } catch {
      // localStorage 접근 실패 시 무시 (Safari 프라이빗 등)
    }
  }, [location.pathname, location.search]);

  // 이미지 생성 진입경로 — 생성 플로우 밖에서는 값이 없으므로 태그를 지운다.
  // 안 지우면 플로우를 떠난 뒤에도 옛 경로가 남아 잘못된 원인으로 읽힌다.
  useEffect(() => {
    setReportTag('image_entry_route', getEntryRoute() ?? null);
  }, [location.pathname, location.search]);
};
