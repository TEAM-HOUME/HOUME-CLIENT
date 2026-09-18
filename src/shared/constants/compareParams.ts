/**
 * 홈 탭과 비교 탭이 쓰는 URL 쿼리 파라미터 이름.
 *
 * shared에 두는 이유: 비교 탭 주소를 만드는 곳이 홈(pages/home)만이 아니다.
 * 딥링크 라우트(routes/), 비교 완료 토스트(routes/), 이미지 생성 가드(pages/imageSetup)가 같은 주소로 보내야 하는데
 * 화면끼리는 import할 수 없어 공용 위치가 필요하다.
 */

/** 홈 탭 (`/?tab=explore|product|compare`). 값은 HomeTab(shared/types/tabNavigation) */
export const HOME_TAB_PARAM = 'tab';

/** 진행 중인 비교를 가리킨다 (`/?tab=compare&jobId=xxx`) */
export const COMPARE_JOB_ID_PARAM = 'jobId';

/** 프리셋 고정 결과를 가리킨다 (`/?tab=compare&presetId=1`) */
export const COMPARE_PRESET_ID_PARAM = 'presetId';

/**
 * 입력창에 채워둘 상품 URL.
 * DeepLinkRoute가 상품 URL을 복원해 넣고 → CompareTab이 읽어 입력창을 채운다
 * → job이 만들어지면 productUrl은 지우고 jobId를 넣는다
 */
export const COMPARE_PRODUCT_URL_PARAM = 'productUrl';
