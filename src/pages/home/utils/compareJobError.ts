import { isAxiosError } from 'axios';

import { COMPARE_REQUEST_ERROR_CODE } from '@pages/home/constants/compareErrorCode';

/** 실패 응답 본문. 서버는 `msg`로 내려주고 레포의 `BaseResponse`는 `message`로 선언돼 있어 둘 다 받도록 처리 */
interface ServerErrorBody {
  code?: number;
  msg?: string;
  message?: string;
}

/** 서버 BaseResponse의 비즈니스 코드. HTTP 상태만으로는 갈리지 않는 경우가 있어 이 값으로 판별한다 */
export const getServerErrorCode = (error: unknown): number | null => {
  if (!isAxiosError<ServerErrorBody>(error)) return null;

  const code = error.response?.data?.code;
  return typeof code === 'number' ? code : null;
};

/**
 * 존재하지 않는 jobId로 조회한 경우
 *
 * 같은 404에 '지원하지 않는 URL'(40400)·'회원을 찾을 수 없음'(40401)도 오기 때문에
 * HTTP 상태가 아니라 비즈니스 코드로 판별한다. 안내 문구가 서로 달라야 한다.
 */
export const isCompareJobNotFound = (error: unknown): boolean =>
  getServerErrorCode(error) === COMPARE_REQUEST_ERROR_CODE.JOB_NOT_FOUND;

/** 존재하지 않는 presetId로 조회한 경우 */
export const isComparePresetNotFound = (error: unknown): boolean =>
  getServerErrorCode(error) === COMPARE_REQUEST_ERROR_CODE.PRESET_NOT_FOUND;

/**
 * 서버가 내려준 실패 사유를 꺼낸다. 서버가 내려준 실패 사유가 없으면 null이고, 뷰에서 기본 에러 문구를 제공한다.
 * (ex: 유효하지 않은 URL로 job 생성이 400에 막히는 경우)
 */
export const getServerErrorMessage = (error: unknown): string | null => {
  if (!isAxiosError<ServerErrorBody>(error)) return null;

  const message = error.response?.data?.msg ?? error.response?.data?.message;
  return typeof message === 'string' && message.length > 0 ? message : null;
};
