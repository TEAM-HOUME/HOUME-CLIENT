// useONNXModel 훅
// - ONNX 모델 로딩 및 추론 실행 책임
// - 입력: HTMLImageElement
// - 전처리: 640x640 letterbox → float32 tensor 생성
// - 출력: boxes/scores/labels를 가공해 Detection[] 반환
// - 라벨: 모델(1‑based 가정) → 내부 표준(0‑based)로 정규화
// - 가구 외 클래스는 훅 단계에서 즉시 제외
import { useState, useEffect, useCallback } from 'react';

import * as ort from 'onnxruntime-web';

import { preprocessImage } from '../utils/imageProcessing'; // 입력 이미지를 640x640 텐서로 변환
import {
  isFurnitureIndex,
  normalizeObj365Label,
} from '../utils/obj365Furniture';

import type { Detection, ProcessedDetections } from '../types/detection';

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/'; // WebAssembly 경로 설정

export function useONNXModel(modelPath: string) {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 모델 바이너리 로드 및 세션 생성
    // - content-type 및 헤더 스니핑으로 잘못된 경로 조기 차단
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
        const arrayBuffer = await response.arrayBuffer(); // 모델 바이너리 로드
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

      // 1) 전처리: 640x640 letterbox 후 CHW(float32) 텐서 생성
      const { tensor } = await preprocessImage(imageElement, 640, 640);

      const inputTensor = new ort.Tensor('float32', tensor, [1, 3, 640, 640]); // 입력 이미지 텐서
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

      // 2) 추론 실행: labels/boxes/scores 출력 기대
      const results = await session.run(feeds);

      // 3) 출력 텐서 파싱
      // - labels는 BigInt64Array로 반환될 수 있음
      const labelsData = results.labels.data;
      const boxes = results.boxes.data as Float32Array;
      const scores = results.scores.data as Float32Array;

      const detections: Detection[] = [];
      const numDetections = scores.length;

      for (let i = 0; i < numDetections; i++) {
        // 4) 점수 임계값 필터(실험값 0.5)
        if (scores[i] > 0.5) {
          const x = boxes[i * 4];
          const y = boxes[i * 4 + 1];
          const x2 = boxes[i * 4 + 2];
          const y2 = boxes[i * 4 + 3];

          // 5) 라벨 정규화: 모델 1‑based → 내부 0‑based
          // - DETR/DFINE 계열은 0: 배경, 1부터 실제 클래스인 구성이 흔함
          // - 내부 로직(JS/TS)은 0‑based가 자연스러우므로 경계에서 변환
          const label1 =
            labelsData instanceof BigInt64Array
              ? Number(labelsData[i])
              : (labelsData as Float32Array)[i];

          const classIndex0 = normalizeObj365Label(label1);
          // 6) 가구 외 클래스 드롭: 이후 파이프라인 단순화 목적
          if (!isFurnitureIndex(classIndex0)) continue;

          detections.push({
            bbox: [x, y, x2 - x, y2 - y],
            score: scores[i],
            label: classIndex0, // 내부 표준: 0‑based index 저장
            // className 부여 안 함: 이름표 비사용 정책
          });
        }
      }

      const inferenceTime = performance.now() - startTime;

      // 7) 실행 시간과 함께 결과 반환
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
