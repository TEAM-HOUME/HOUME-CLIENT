import { useState, useEffect, useCallback } from 'react';

import * as ort from 'onnxruntime-web';

import { Detection, ProcessedDetections } from '../types';
import { COCO_CLASSES } from '../utils/cocoClasses';
import { preprocessImage } from '../utils/imageProcessing';
import { OBJ365_CLASSES } from '../utils/obj365Classes';

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

export function useONNXModel(modelPath: string) {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadModel() {
      try {
        setIsLoading(true);
        setProgress(10);

        const response = await fetch(modelPath);
        if (!response.ok)
          throw new Error(`모델 로드 실패: ${response.statusText}`);
        const contentType = response.headers.get('content-type') || '';
        if (
          contentType.includes('text/html') ||
          contentType.includes('text/plain')
        ) {
          throw new Error(
            '모델 경로가 잘못되었거나 HTML/텍스트가 반환되었습니다'
          );
        }

        setProgress(30);
        const arrayBuffer = await response.arrayBuffer();
        const head = new Uint8Array(arrayBuffer.slice(0, 256));
        const headText = new TextDecoder('utf-8', { fatal: false }).decode(
          head
        );
        if (/<!doctype|<html|Not Found|Error/i.test(headText)) {
          throw new Error('모델 파일 대신 HTML/오류 페이지가 로드되었습니다');
        }

        setProgress(60);
        const newSession = await ort.InferenceSession.create(arrayBuffer, {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all',
        });

        if (isMounted) {
          setSession(newSession);
          setProgress(100);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : '모델 로드 중 오류 발생'
          );
          setIsLoading(false);
        }
      }
    }

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [modelPath]);

  const runInference = useCallback(
    async (imageElement: HTMLImageElement): Promise<ProcessedDetections> => {
      if (!session) {
        throw new Error('모델이 로드되지 않았습니다');
      }

      const startTime = performance.now();

      const { tensor } = await preprocessImage(imageElement, 640, 640);

      const inputTensor = new ort.Tensor('float32', tensor, [1, 3, 640, 640]);
      // orig_target_sizes는 int64 타입이어야 함
      const sizeTensor = new ort.Tensor(
        'int64',
        new BigInt64Array([BigInt(640), BigInt(640)]),
        [1, 2]
      );

      const feeds = {
        images: inputTensor,
        orig_target_sizes: sizeTensor,
      };

      const results = await session.run(feeds);

      // labels는 BigInt64Array로 반환될 수 있음
      const labelsData = results.labels.data;
      const boxes = results.boxes.data as Float32Array;
      const scores = results.scores.data as Float32Array;

      const detections: Detection[] = [];
      const numDetections = scores.length;

      for (let i = 0; i < numDetections; i++) {
        if (scores[i] > 0.5) {
          const x = boxes[i * 4];
          const y = boxes[i * 4 + 1];
          const x2 = boxes[i * 4 + 2];
          const y2 = boxes[i * 4 + 3];

          // BigInt를 Number로 변환
          const labelValue =
            labelsData instanceof BigInt64Array
              ? Number(labelsData[i])
              : (labelsData as Float32Array)[i];

          // Objects365 모델인지 확인
          const isObj365Model = modelPath.includes('obj365');
          const classes = isObj365Model ? OBJ365_CLASSES : COCO_CLASSES;

          // Objects365는 인덱스가 1부터 시작 (0은 background)
          const classIndex = isObj365Model ? labelValue - 1 : labelValue;

          detections.push({
            bbox: [x, y, x2 - x, y2 - y],
            score: scores[i],
            label: labelValue,
            className: classes[classIndex] || `Class ${labelValue}`,
          });
        }
      }

      const inferenceTime = performance.now() - startTime;

      return {
        detections,
        inferenceTime,
      };
    },
    [session]
  );

  return {
    runInference,
    isLoading,
    error,
    progress,
  };
}
