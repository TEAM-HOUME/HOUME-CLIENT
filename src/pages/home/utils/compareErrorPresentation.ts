import {
  COMPARE_ERROR_CASE,
  COMPARE_REQUEST_ERROR_CODE,
  type CompareErrorCase,
} from '../constants/compareErrorCode.ts';

export const COMPARE_ERROR_ACTION = {
  SEARCH_NEW_LINK: 'searchNewLink',
  RETRY: 'retry',
  REENTER_LINK: 'reenterLink',
} as const;

type CompareErrorAction =
  (typeof COMPARE_ERROR_ACTION)[keyof typeof COMPARE_ERROR_ACTION];

export interface CompareErrorContent {
  title: string;
  description: readonly [string, string];
  buttonLabel: string;
  action: CompareErrorAction;
}

export const COMPARE_ERROR_CONTENT: Record<
  CompareErrorCase,
  CompareErrorContent
> = {
  [COMPARE_ERROR_CASE.PRODUCT_UNAVAILABLE]: {
    title: '상품 정보를 불러올 수 없어요',
    description: [
      '삭제되었거나 판매가 종료된 상품일 수 있어요.',
      '구매 가능한 링크인지 다시 확인해주세요.',
    ],
    buttonLabel: '다른 링크로 검색하기',
    action: COMPARE_ERROR_ACTION.SEARCH_NEW_LINK,
  },
  [COMPARE_ERROR_CASE.SCRAPING_BLOCKED]: {
    title: '이 사이트의 상품 정보는 가져올 수 없어요',
    description: [
      '일부 쇼핑몰은 상품 정보 수집이 제한되어 있어요.',
      '다른 링크로 다시 시도해주세요.',
    ],
    buttonLabel: '다른 링크로 검색하기',
    action: COMPARE_ERROR_ACTION.SEARCH_NEW_LINK,
  },
  [COMPARE_ERROR_CASE.COMPARE_FAILED]: {
    title: '상품 비교 중 문제가 생겼어요',
    description: [
      '비슷한 상품을 찾는 도중 오류가 발생했어요.',
      '다른 링크로 다시 시도해주세요.',
    ],
    buttonLabel: '다른 링크로 검색하기',
    action: COMPARE_ERROR_ACTION.SEARCH_NEW_LINK,
  },
  [COMPARE_ERROR_CASE.BUSY]: {
    title: '잠시 대기 중이에요',
    description: [
      '현재 이용자가 많아 처리 중이에요.',
      '잠시 후 다시 시도해주세요.',
    ],
    buttonLabel: '다시 시도하기',
    action: COMPARE_ERROR_ACTION.RETRY,
  },
  [COMPARE_ERROR_CASE.TEMPORARY]: {
    title: '일시적인 오류가 발생했어요',
    description: [
      '문제가 계속되면 houme.dev@gmail.com으로',
      '어떤 오류가 있는지 알려주세요.',
    ],
    buttonLabel: '다시 시도하기',
    action: COMPARE_ERROR_ACTION.RETRY,
  },
  [COMPARE_ERROR_CASE.INVALID_FORMAT]: {
    title: '링크 형식이 올바르지 않아요',
    description: [
      '브라우저 주소창에서 전체 링크를 복사한 뒤',
      '다시 붙여넣어주세요.',
    ],
    buttonLabel: '링크 다시 입력하기',
    action: COMPARE_ERROR_ACTION.REENTER_LINK,
  },
  [COMPARE_ERROR_CASE.INVALID_LINK]: {
    title: '유효하지 않은 링크예요',
    description: [
      '붙여넣은 링크에 빠진 부분이나 오타가 없는지',
      '다시 확인해주세요.',
    ],
    buttonLabel: '링크 다시 입력하기',
    action: COMPARE_ERROR_ACTION.REENTER_LINK,
  },
};

const ERROR_CASE_BY_CODE: Readonly<Partial<Record<number, CompareErrorCase>>> =
  {
    [COMPARE_REQUEST_ERROR_CODE.INVALID_URL]: COMPARE_ERROR_CASE.INVALID_LINK,
    [COMPARE_REQUEST_ERROR_CODE.EXTRACT_FAILED]:
      COMPARE_ERROR_CASE.PRODUCT_UNAVAILABLE,
    [COMPARE_REQUEST_ERROR_CODE.PRODUCT_INFO_UNAVAILABLE]:
      COMPARE_ERROR_CASE.PRODUCT_UNAVAILABLE,
    [COMPARE_REQUEST_ERROR_CODE.PRODUCT_SALE_ENDED]:
      COMPARE_ERROR_CASE.PRODUCT_UNAVAILABLE,
    [COMPARE_REQUEST_ERROR_CODE.PAGE_LOAD_FAILED]:
      COMPARE_ERROR_CASE.PRODUCT_UNAVAILABLE,
    [COMPARE_REQUEST_ERROR_CODE.FORBIDDEN_URL]:
      COMPARE_ERROR_CASE.SCRAPING_BLOCKED,
    [COMPARE_REQUEST_ERROR_CODE.SCRAPING_BLOCKED]:
      COMPARE_ERROR_CASE.SCRAPING_BLOCKED,
    [COMPARE_REQUEST_ERROR_CODE.UNSUPPORTED_URL]:
      COMPARE_ERROR_CASE.SCRAPING_BLOCKED,
    [COMPARE_REQUEST_ERROR_CODE.TIMEOUT]: COMPARE_ERROR_CASE.COMPARE_FAILED,
    [COMPARE_REQUEST_ERROR_CODE.SEARCH_FAILED]:
      COMPARE_ERROR_CASE.COMPARE_FAILED,
    [COMPARE_REQUEST_ERROR_CODE.SEARCH_TIMEOUT]:
      COMPARE_ERROR_CASE.COMPARE_FAILED,
    [COMPARE_REQUEST_ERROR_CODE.MERGE_FAILED]:
      COMPARE_ERROR_CASE.COMPARE_FAILED,
    [COMPARE_REQUEST_ERROR_CODE.TOO_MANY_USERS]: COMPARE_ERROR_CASE.BUSY,
    [COMPARE_REQUEST_ERROR_CODE.JOB_NOT_FOUND]: COMPARE_ERROR_CASE.TEMPORARY,
    [COMPARE_REQUEST_ERROR_CODE.INTERNAL_SERVER_ERROR]:
      COMPARE_ERROR_CASE.TEMPORARY,
    [COMPARE_REQUEST_ERROR_CODE.PRESET_NOT_FOUND]: COMPARE_ERROR_CASE.TEMPORARY,
  };

export const resolveCompareErrorCase = (
  errorCode: number | null
): CompareErrorCase =>
  (errorCode === null ? undefined : ERROR_CASE_BY_CODE[errorCode]) ??
  COMPARE_ERROR_CASE.TEMPORARY;
