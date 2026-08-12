import type { ValidLoginStatus, SignupStep } from '@analytics/params/auth';
import type { BannerChipParams } from '@analytics/params/bannerDetail';
import type { ImageEntryRoute, LoginEntryRoute } from '@analytics/params/gate';
import type {
  AnalyticsScreenName,
  LoginStatus,
} from '@analytics/params/global';
import type {
  HomeBannerParams,
  HomeStyleParams,
} from '@analytics/params/homeContent';
import type { ImageSetupParams } from '@analytics/params/imageSetup';
import type { LandingParams } from '@analytics/params/landing';
import type { SectionName } from '@analytics/params/path';
import type { ProductCardParams } from '@analytics/params/productCard';
import type { ResultParams } from '@analytics/params/result';
import type { ScrollDepth } from '@analytics/params/scrollDepth';
import type { ShopParams } from '@analytics/params/shop';
import type { SpaceParams } from '@analytics/params/space';
import type { GaToastType } from '@analytics/params/toast';

/** Firebase logEvent에 허용되는 파라미터 값 타입 */
export type AnalyticsParamValue = string | number | boolean | null;

/**
 * GA4 이벤트별 추가 파라미터 (노션 Parameter 컬럼 v2.0.0)
 *
 * - DB 전송 값은 이벤트 발생 시점 데이터를 그대로 전달
 * - `undefined` 값은 Firebase 전송 시 제외 (콘솔 로그에는 포함)
 *
 * **주의** — 여기 담기는 값은 GA4뿐 아니라 **Sentry breadcrumb으로도 전송된다**
 * (`track.ts`의 `addReportBreadcrumb`). 새 필드를 추가할 때 개인정보가 들어가지 않는지
 * 확인해야 한다. 예외 처리가 필요하면 `track.ts`의 `toBreadcrumbData`에서 거른다.
 * (현재 예외: `page_path`는 주소에 인가코드가 실릴 수 있어 URL 스크럽을 통과시킨다)
 */
export type TrackEventParams = {
  // --- 1. 전역 / 경로 ---
  screen_name?: AnalyticsScreenName;
  return_screen_name?: AnalyticsScreenName;
  previous_screen_name?: AnalyticsScreenName;
  page_path?: string;
  analytics_environment?: string;
  login_status?: LoginStatus;
  is_new_user?: boolean;
  scroll_depth?: ScrollDepth;
  section_name?: SectionName;

  // --- 2. 랜딩 ---
} & LandingParams &
  // --- 3. 게이트 ---
  {
    login_entry_route?: LoginEntryRoute | string;
    image_entry_route?: ImageEntryRoute;
  } &
  // --- 4~6. 홈 콘텐츠 / 배너 상세 / 상품 카드 ---
  HomeBannerParams &
  HomeStyleParams &
  BannerChipParams &
  ProductCardParams &
  // --- 7. 공간/도면 ---
  SpaceParams &
  // --- 8. 상품 탭 ---
  ShopParams &
  // --- 9. imageSetup ---
  ImageSetupParams &
  // --- 10. 로그인/회원가입 ---
  {
    is_valid_login?: ValidLoginStatus;
    signup_step?: SignupStep;
  } &
  // --- 11. 결과·마이페이지·로딩 ---
  ResultParams &
  // --- 12. 토스트 / 에러 ---
  {
    toast_type?: GaToastType | string;
    error_code?: string;
  };
