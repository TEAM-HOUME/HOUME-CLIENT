// DetectionHotspots
// - 모델 추론 결과를 가구 후보로 정제하고 핫스팟으로 렌더
// - 좌표 흐름: 모델(640) → 원본 픽셀 → 컨테이너(object-fit: cover 보정)
// - 컴포넌트 책임: 추론 실행/후처리 호출, 좌표 투영, 단순 토글 UI
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useONNXModel } from '@/pages/generate/hooks/useOnnxModel';
import type { ProcessedDetections } from '@/pages/generate/types/detection';
import {
  FURNITURE_CATEGORY_SET,
  type FurnitureCategory,
} from '@/pages/generate/utils/furnitureCategories';
import { toImageSpaceBBox } from '@/pages/generate/utils/imageProcessing';
import { isFurnitureClassId } from '@/pages/generate/utils/obj365Classes';
import {
  refineFurnitureDetections,
  type Detection as RawDetection,
} from '@/pages/generate/utils/refineFurnitureDetections';

import HotspotColor from '@shared/assets/icons/icnHotspotColor.svg?react';
import HotspotGray from '@shared/assets/icons/icnHotspotGray.svg?react';

import * as styles from './DetectionHotspots.css.ts';

// 수치 보정 유틸리티
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

// 감지 신뢰도 최소 임계값(threshold)
// - refineFurnitureDetections.confidence ∈ [0,1]
const MIN_CONFIDENCE = 0.35;

// 가구 관련 클래스만 선별
// - 후보가 0개면 사용자 경험을 위해 원본 일부 유지
const selectFurnitureCandidates = (detections: RawDetection[]) => {
  const filtered = detections.filter((detection) =>
    isFurnitureClassId(detection.label)
  );
  // 필터 결과가 없으면 원본을 그대로 사용해 최소한의 핫스팟을 유지해요.
  return filtered.length > 0 ? filtered : detections;
};

type DetectionData = {
  id: number;
  bbox: [number, number, number, number];
  score: number;
  label?: number;
  className?: string;
  refinedLabel?: FurnitureCategory;
  refinedKoLabel?: string;
  confidence?: number;
};

type RenderedHotspot = DetectionData & {
  cx: number;
  cy: number;
};

interface DetectionHotspotsProps {
  imageUrl: string;
  mirrored?: boolean;
}

export const DetectionHotspots = ({
  imageUrl,
  mirrored = false,
}: DetectionHotspotsProps) => {
  // DOM 참조(ref)
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // 추론 결과 상태
  const [detections, setDetections] = useState<DetectionData[]>([]);
  // 선택 토글 상태
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // 원본 이미지 메타
  const [imageMeta, setImageMeta] = useState<{
    width: number;
    height: number;
  } | null>(null);
  // 렌더 컨테이너 크기(좌표 투영용)
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  // NOTE: 모델 파일은 public/models 에 배치하는 것을 권장
  // 대체로 Objects365 기반 모델을 사용해 가구류 감지 성능을 확보
  const { runInference, isLoading, error } = useONNXModel(
    '/models/dfine_s_obj365.onnx'
  );

  // NOTE: S3(CDN)에서 CORS가 허용되었으므로 프록시 없이 직접 로드
  // 교차 출처 이미지라도 `crossOrigin('anonymous')` + 서버 CORS 허용으로 처리

  // 교차 출처 이미지를 안전하게 로드하는 헬퍼
  // - canvas taint 방지 목적
  // - 유틸/훅 분리 후보: loadCorsImage 또는 useCorsImage
  async function loadCorsImage(url: string): Promise<HTMLImageElement | null> {
    try {
      const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
      if (!res.ok) return null;
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = objUrl;
      });
      URL.revokeObjectURL(objUrl);
      return img;
    } catch {
      return null;
    }
  }

  // 후처리 파이프라인
  // 1) 640 좌표 → 원본 픽셀 역투영
  // 2) 가구 클래스 선별 → 도메인 리파인
  // 3) UI 임계값 필터 및 폴백
  const processDetections = useCallback(
    (imageEl: HTMLImageElement, inference: ProcessedDetections) => {
      const natW = imageEl.naturalWidth || imageEl.width;
      const natH = imageEl.naturalHeight || imageEl.height;
      // 모델 출력 좌표를 실제 이미지 픽셀 기준으로 변환하는 전처리
      const pixelDetections: RawDetection[] = inference.detections.map(
        (detection) => {
          const { x, y, w, h } = toImageSpaceBBox(imageEl, detection.bbox);
          return {
            ...detection,
            bbox: [x, y, w, h] as [number, number, number, number],
          };
        }
      );

      const candidateDetections = selectFurnitureCandidates(pixelDetections);
      console.log('[Detection] furniture candidates:', {
        total: pixelDetections.length,
        candidates: candidateDetections.length,
      });

      setImageMeta({ width: natW, height: natH });

      if (candidateDetections.length === 0) {
        setDetections([]);
        setSelectedId(null);
        return;
      }

      // refineFurnitureDetections 로 가구 카테고리 재매핑 및 신뢰도 보정
      const { refinedDetections, context, options } = refineFurnitureDetections(
        candidateDetections,
        {
          width: natW,
          height: natH,
        }
      );

      console.log('[Detection] refined furniture:', refinedDetections);
      console.log('[Detection] context/options:', { context, options });

      // UI 표시 임계값 필터
      const reliableDetections = refinedDetections.filter(
        (det) =>
          (det.confidence ?? 0) >= MIN_CONFIDENCE &&
          FURNITURE_CATEGORY_SET.has(det.refinedLabel)
      );

      // 신뢰도 기준 미달 시 최대 3개의 후보만 남기는 폴백
      // - 폴백 개수 상수화/설정화 고려
      const effectiveDetections =
        reliableDetections.length > 0
          ? reliableDetections
          : refinedDetections.slice(0, Math.min(3, refinedDetections.length));

      if (effectiveDetections.length === 0) {
        setDetections([]);
        setSelectedId(null);
        return;
      }

      if (reliableDetections.length === 0) {
        console.warn(
          '[Detection] fallback to refined results with low confidence'
        );
      }

      const data: DetectionData[] = effectiveDetections.map((det, idx) => ({
        id: idx,
        bbox: det.bbox,
        score: det.score,
        label: det.label,
        className: det.className,
        refinedLabel: det.refinedLabel,
        refinedKoLabel: det.refinedKoLabel,
        confidence: det.confidence,
      }));

      setDetections(data);
      setSelectedId(null);
    },
    []
  );

  // 추론 실행 러너
  // - 기본: <img>로 추론 후 처리
  // - 예외: SecurityError 시 CORS 이미지로 재시도
  const run = useCallback(async () => {
    if (!imgRef.current || !containerRef.current) return;
    try {
      const imageEl = imgRef.current;
      const result = await runInference(imageEl);

      // 1) console 에 초기 감지 결과를 출력
      console.log('[Detection] raw detections:', result);

      processDetections(imageEl, result);
    } catch (e) {
      // CORS로 인한 canvas taint 방지: 교차 출처 이미지를 CORS로 다시 로드한 뒤 재시도
      if (e instanceof DOMException && e.name === 'SecurityError') {
        console.warn(
          '[Detection] Canvas tainted by cross-origin image. Retrying with CORS fetch...'
        );
        const corsImg = await loadCorsImage(imageUrl);
        if (corsImg) {
          try {
            const result = await runInference(corsImg);
            console.log('[Detection] raw detections:', result);
            if (imgRef.current) {
              processDetections(imgRef.current, result);
            }
            return;
          } catch (e2) {
            console.error('[Detection] inference retry failed', e2);
          }
        }
      }
      console.error('[Detection] inference error', e);
    }
  }, [processDetections, runInference, imageUrl]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const onLoad = () => run(); // 캐시 로드 포함 즉시 실행
    if (img.complete) {
      // 이미지가 캐시로부터 즉시 로드된 경우
      run();
    } else {
      img.addEventListener('load', onLoad);
    }
    return () => img.removeEventListener('load', onLoad);
  }, [imageUrl, run]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      setContainerSize((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight }
      );
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateSize()); // 레이아웃 변화 즉시 반응
      observer.observe(container);
      return () => observer.disconnect();
    }

    const handleResize = () => updateSize(); // 폴백: 윈도우 리사이즈 이벤트
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderedHotspots: RenderedHotspot[] = useMemo(() => {
    if (!imageMeta || containerSize.width === 0 || containerSize.height === 0) {
      return [];
    }

    const { width: natW, height: natH } = imageMeta;
    const { width: renderedW, height: renderedH } = containerSize;
    if (natW === 0 || natH === 0 || renderedW === 0 || renderedH === 0) {
      return [];
    }

    // object-fit: cover 보정
    // - 확대율(scaleCover)과 잘림 오프셋(cropOffset) 계산
    const scaleCover = Math.max(renderedW / natW, renderedH / natH);
    const cropOffsetX = (natW * scaleCover - renderedW) / 2;
    const cropOffsetY = (natH * scaleCover - renderedH) / 2;

    return detections.map((det) => {
      const [x, y, w, h] = det.bbox;
      const cxImg = x + w / 2;
      const cyImg = y + h / 2;
      let cx = cxImg * scaleCover - cropOffsetX;
      let cy = cyImg * scaleCover - cropOffsetY;
      if (mirrored) {
        cx = renderedW - cx; // 좌우 반전 옵션
      }
      cx = clamp(cx, 0, renderedW);
      cy = clamp(cy, 0, renderedH);

      // 컨테이너 좌표계로 투영한 핫스팟 중심 좌표를 반환
      return {
        ...det,
        cx,
        cy,
      };
    });
  }, [containerSize, detections, imageMeta, mirrored]);

  const content = useMemo(() => {
    return (
      <div ref={containerRef} className={styles.container}>
        <img
          ref={imgRef}
          crossOrigin="anonymous"
          src={imageUrl}
          alt="generated"
          className={styles.image}
        />
        <div className={styles.overlay}>
          {renderedHotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              className={styles.hotspot}
              style={{ left: hotspot.cx, top: hotspot.cy }}
              onClick={() =>
                setSelectedId((prev) =>
                  prev === hotspot.id ? null : hotspot.id
                )
              }
              aria-label={`hotspot ${hotspot.refinedKoLabel ?? hotspot.className ?? ''}`}
            >
              {selectedId === hotspot.id ? <HotspotColor /> : <HotspotGray />}
            </button>
          ))}
        </div>
      </div>
    );
  }, [imageUrl, renderedHotspots, selectedId]);

  if (error) {
    // 모델 로드 실패 시에도 이미지 자체는 보여주도록 구현
    console.warn('[Detection] model error:', error);
  }
  if (isLoading) {
    return (
      <div className={styles.container}>
        <img src={imageUrl} alt="generated" className={styles.image} />
      </div>
    );
  }
  return content;
};

export default DetectionHotspots;
