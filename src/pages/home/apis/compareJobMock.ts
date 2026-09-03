// [임시 파일] 서버 API 연동 후 삭제. 이 파일을 부르는 useCreateCompareJobMutation·useCompareJobStatusQuery의 분기도 함께 지운다
// ------------------------------
// 서버 API가 나오기 전까지 쓰는 임시 응답
// ------------------------------
// 서버가 붙으면 이 파일과 이 파일을 부르는 두 군데(useCreateCompareJobMutation·useCompareJobStatusQuery)를
// 지우면 된다. 프로덕션 빌드에서는 USE_COMPARE_MOCK이 false라 절대 타지 않는다.
//
// 주의: USE_COMPARE_MOCK만 따로 떼어 useCompareHistoryQuery·useComparePresetQuery·
// useComparePresetsQuery도 가져다 쓴다. job이 먼저 연동돼 이 파일을 지우면 저 세 곳도
// import 에러로 같이 깨지니, 그쪽 mock이 아직 필요하면 USE_COMPARE_MOCK만 다른 곳으로
// 옮기고 이 파일의 나머지(job 전용 mock 로직)만 지운다.
//
// 시작 시각을 jobId 안에 넣어 두기 때문에 모듈 상태가 없다.
// 새로고침해도 URL의 jobId로 같은 진행 상황이 이어져 복원 동작까지 그대로 확인할 수 있다.

import {
  MOCK_COMPARE_JOB_DONE,
  MOCK_COMPARE_JOB_EMPTY,
  MOCK_COMPARE_JOB_FAILED,
} from '@pages/home/constants/compareMockData';
import {
  COMPARE_JOB_STAGE,
  COMPARE_JOB_STATUS,
  COMPARE_SOURCE_STATUS,
  type CompareJobStatusResponse,
  type CreateCompareJobResponse,
} from '@pages/home/types/compare';

/** 개발 환경에서만 켜진다. 서버가 붙으면 이 값을 false로 두거나 파일을 지운다 */
export const USE_COMPARE_MOCK = import.meta.env.DEV;

/**
 * 상품 URL에 아래 단어가 들어 있으면 그 시나리오로 응답한다.
 * 예) `https://example.com/empty` 를 넣으면 결과 0건 화면을 볼 수 있다.
 */
const MOCK_SCENARIO = {
  DONE: 'done',
  EMPTY: 'empty',
  FAILED: 'fail',
} as const;

type MockScenario = (typeof MOCK_SCENARIO)[keyof typeof MOCK_SCENARIO];

/** 서버가 알려준 단계별 예상 시간(SCRAPING 2초 · SEARCHING 3~5초 · MERGING 5초)을 그대로 따랐다 */
const STAGE_TIMELINE_MS = {
  PENDING_UNTIL: 300,
  SCRAPING_UNTIL: 1_000,
  SEARCHING_UNTIL: 3_000,
  MERGING_UNTIL: 5_000,
} as const;

const JOB_ID_PREFIX = 'mock';

const resolveScenario = (url: string): MockScenario => {
  const lowered = url.toLowerCase();
  if (lowered.includes(MOCK_SCENARIO.EMPTY)) return MOCK_SCENARIO.EMPTY;
  if (lowered.includes(MOCK_SCENARIO.FAILED)) return MOCK_SCENARIO.FAILED;
  return MOCK_SCENARIO.DONE;
};

/** `mock-done-1756280000000` 형태 — 시나리오와 시작 시각을 jobId에 실어 보낸다 */
export const createMockCompareJob = (
  url: string
): CreateCompareJobResponse => ({
  jobId: `${JOB_ID_PREFIX}-${resolveScenario(url)}-${Date.now()}`,
  status: COMPARE_JOB_STATUS.PENDING,
});

export const isMockCompareJobId = (jobId: string): boolean =>
  jobId.startsWith(`${JOB_ID_PREFIX}-`);

const parseMockJobId = (
  jobId: string
): { scenario: MockScenario; startedAt: number } => {
  const [, scenario, startedAt] = jobId.split('-');

  return {
    scenario: (scenario ?? MOCK_SCENARIO.DONE) as MockScenario,
    startedAt: Number(startedAt),
  };
};

const ALL_WAITING = {
  catalog: COMPARE_SOURCE_STATUS.WAITING,
  coupang: COMPARE_SOURCE_STATUS.WAITING,
  ebay: COMPARE_SOURCE_STATUS.WAITING,
} as const;

const ALL_DONE = {
  catalog: COMPARE_SOURCE_STATUS.DONE,
  coupang: COMPARE_SOURCE_STATUS.DONE,
  ebay: COMPARE_SOURCE_STATUS.DONE,
} as const;

/** SEARCHING 동안 3개 소스가 서로 다른 시점에 끝나는 것을 흉내낸다 */
const SOURCE_DONE_AT_MS = { catalog: 2_000, coupang: 2_600, ebay: 1_500 };

const buildRunningResponse = (
  jobId: string,
  startedAt: number
): CompareJobStatusResponse => {
  const elapsedMs = Date.now() - startedAt;
  const doneBy = (ms: number) =>
    elapsedMs > ms ? COMPARE_SOURCE_STATUS.DONE : COMPARE_SOURCE_STATUS.RUNNING;

  const { currentStage, sources } =
    elapsedMs < STAGE_TIMELINE_MS.SCRAPING_UNTIL
      ? { currentStage: COMPARE_JOB_STAGE.SCRAPING, sources: ALL_WAITING }
      : elapsedMs < STAGE_TIMELINE_MS.SEARCHING_UNTIL
        ? {
            currentStage: COMPARE_JOB_STAGE.SEARCHING,
            sources: {
              catalog: doneBy(SOURCE_DONE_AT_MS.catalog),
              coupang: doneBy(SOURCE_DONE_AT_MS.coupang),
              ebay: doneBy(SOURCE_DONE_AT_MS.ebay),
            },
          }
        : { currentStage: COMPARE_JOB_STAGE.MERGING, sources: ALL_DONE };

  return {
    jobId,
    status:
      elapsedMs < STAGE_TIMELINE_MS.PENDING_UNTIL
        ? COMPARE_JOB_STATUS.PENDING
        : COMPARE_JOB_STATUS.RUNNING,
    currentStage,
    sources,
    startedAt: new Date(startedAt).toISOString(),
    completedAt: null,
    result: null,
  };
};

/** 경과 시간에 따라 진행 중 → 완료로 넘어가는 응답을 만든다 */
export const getMockCompareJobStatus = (
  jobId: string
): CompareJobStatusResponse => {
  const { scenario, startedAt } = parseMockJobId(jobId);
  const elapsedMs = Date.now() - startedAt;

  if (elapsedMs < STAGE_TIMELINE_MS.MERGING_UNTIL) {
    return buildRunningResponse(jobId, startedAt);
  }

  const finished = {
    [MOCK_SCENARIO.DONE]: MOCK_COMPARE_JOB_DONE,
    [MOCK_SCENARIO.EMPTY]: MOCK_COMPARE_JOB_EMPTY,
    [MOCK_SCENARIO.FAILED]: MOCK_COMPARE_JOB_FAILED,
  }[scenario];

  return { ...finished, jobId };
};
