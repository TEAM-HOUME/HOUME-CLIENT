import { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import { useUserStore } from '@store/useUserStore';

import { setClarityTag } from '@shared/config/clarity';
import { AB_TEST_STORAGE_KEY, isABTestGroup } from '@shared/types/abTest';

import { getLoginStatus } from '@analytics/utils/loginStatus';
import { resolveScreenName } from '@analytics/utils/screenName/resolveScreenName';

/**
 * GA4 세그먼트 소스를 Clarity 커스텀 태그로 미러링하는 훅
 * RootLayout에서 1회 마운트 — 세션 레코딩·히트맵을 GA4와 같은 축으로 필터링 가능하게 함
 * +) 개인 식별(identify)은 하지 않는다 — Sentry·GA와 동일하게 비식별 원칙 유지 (개인정보처리방침과 정합)
 */
export const useClaritySync = (): void => {
  const location = useLocation();
  const accessToken = useUserStore((state) => state.accessToken);

  // 화면 단위 세그먼트 — SPA 탭 화면(예: home ?tab=product)처럼 pathname이 안 바뀌는 화면을
  // 히트맵/레코딩에서 구분하는 핵심 태그
  useEffect(() => {
    setClarityTag(
      'screen_name',
      resolveScreenName(`${location.pathname}${location.search}`)
    );
  }, [location.pathname, location.search]);

  // 로그인 상태
  useEffect(() => {
    setClarityTag('login_status', getLoginStatus());
  }, [accessToken]);

  // A/B variant — 이미 배정된 값을 storage에서 수동 read만 (여기서 배정을 트리거하지 않음)
  // useABTest()를 호출하면 userId 로딩 전(로그인 직후 등) 조기 랜덤 배정이 캐시되어
  // 이후 userId 기반 결정적 배정을 영구히 덮어쓰므로, 관측용 훅에서는 직접 읽어 태깅만 수행
  useEffect(() => {
    try {
      const cached = localStorage.getItem(AB_TEST_STORAGE_KEY);
      if (cached && isABTestGroup(cached)) {
        setClarityTag('ab_variant', cached);
      }
    } catch {
      // localStorage 접근 실패 시 무시
    }
  }, [location.pathname, location.search]);
};
