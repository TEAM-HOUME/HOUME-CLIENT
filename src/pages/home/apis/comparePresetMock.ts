// [임시 파일] 서버 API 연동 후 삭제. 이 파일을 부르는 useComparePresetQuery의 분기도 함께 지운다
import { AxiosError } from 'axios';

import {
  MOCK_COMPARE_PRESET_1,
  MOCK_COMPARE_PRESET_2,
} from '@pages/home/constants/compareMockData';
import type { ComparePresetResult } from '@pages/home/types/compare';

/** 검색 화면 mock 프리셋 id와 같은 키. 없는 id는 명세의 404를 흉내 내 던진다 */
export const getMockComparePreset = (presetId: number): ComparePresetResult => {
  if (presetId === 1) return MOCK_COMPARE_PRESET_1;
  if (presetId === 2) return MOCK_COMPARE_PRESET_2;
  throw new AxiosError(
    '존재하지 않는 프리셋입니다.',
    AxiosError.ERR_BAD_REQUEST
  );
};
