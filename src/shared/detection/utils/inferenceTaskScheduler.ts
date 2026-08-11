let inferenceTaskQueue: Promise<void> = Promise.resolve();

/**
 * 무거운 이미지/추론 작업을 전역 직렬 큐로 실행
 * - 제출 순서 보장
 * - 이전 작업 실패와 무관하게 다음 작업 진행
 */
export const runSerializedInferenceTask = async <T>(
  task: () => Promise<T>
): Promise<T> => {
  const nextTask = inferenceTaskQueue.then(() => task());
  inferenceTaskQueue = nextTask.then(() => undefined).catch(() => undefined);
  return nextTask;
};
