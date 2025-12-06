// 가구 파이프라인 모니터링 로거
// - 목적: 콘솔 로그 정보량 일관화 + 디버깅을 위한 맥락 보강(context enrichment)

type FurniturePipelineLogLevel = 'info' | 'warn';

export type FurniturePipelineLogOptions = {
  level?: FurniturePipelineLogLevel;
};

const emitConsoleLog = (
  _level: FurniturePipelineLogLevel,
  _event: string,
  _payload?: Record<string, unknown>
) => {};

export const logFurniturePipelineEvent = (
  event: string,
  payload?: Record<string, unknown>,
  options?: FurniturePipelineLogOptions
) => {
  const level: FurniturePipelineLogLevel = options?.level ?? 'info';
  emitConsoleLog(level, event, payload);
};

export const reportFurniturePipelineWarning = (
  message: string,
  extra?: Record<string, unknown>
) => {
  logFurniturePipelineEvent(message, extra, {
    level: 'warn',
  });
};
