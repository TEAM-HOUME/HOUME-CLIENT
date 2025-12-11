// DetectionHotspots
// - 역할: 훅(useFurnitureHotspots)이 만든 가구 핫스팟을 렌더
// - 파이프라인 요약: Obj365 → 가구만 선별 → cabinet만 리파인 → 가구 전체 핫스팟 렌더
// - 비고: 스토어로 핫스팟 상태를 전달해 바텀시트와 연계
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  resolveFurnitureCode,
  type FurnitureCategoryCode,
} from '@pages/generate/constants/furnitureCategoryMapping';
import { useABTest } from '@pages/generate/hooks/useABTest';
import { useDetectionCache } from '@pages/generate/hooks/useDetectionCache';
import { useGeneratedCategoriesQuery } from '@pages/generate/hooks/useFurnitureCuration';
import { useOpenCurationSheet } from '@pages/generate/hooks/useFurnitureCuration';
import { useFurnitureHotspots } from '@pages/generate/hooks/useFurnitureHotspots';
import { useCurationStore } from '@pages/generate/stores/useCurationStore';
import { logResultImgClickBtnSpot } from '@pages/generate/utils/analytics';
import {
  filterAllowedDetectedObjects,
  mapHotspotsToDetectedObjects,
} from '@pages/generate/utils/detectedObjectMapper';
import { logFurniturePipelineEvent } from '@pages/generate/utils/furniturePipelineMonitor';
import {
  buildDetectedCodeToCategoryId,
  resolveCategoryIdForHotspot,
} from '@pages/generate/utils/hotspotCategoryResolver';
import HotspotColor from '@shared/assets/icons/icnHotspotColor.svg?react';
import HotspotGray from '@shared/assets/icons/icnHotspotGray.svg?react';

import * as styles from './DetectionHotspots.css.ts';

import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';
import type { DetectionCacheEntry } from '@pages/generate/stores/useDetectionCacheStore';
import type { ProcessedDetections } from '@pages/generate/types/detection';

const EMPTY_DETECTED_CODES: FurnitureCategoryCode[] = [];

const isSameHotspotArray = (
  prev: FurnitureHotspot[] | null,
  next: FurnitureHotspot[]
) => {
  if (!prev) return false;
  if (prev === next) return true;
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i += 1) {
    const a = prev[i];
    const b = next[i];
    if (
      a.id !== b.id ||
      a.cx !== b.cx ||
      a.cy !== b.cy ||
      a.score !== b.score ||
      a.confidence !== b.confidence ||
      a.label !== b.label ||
      a.className !== b.className ||
      a.finalLabel !== b.finalLabel ||
      a.refinedLabel !== b.refinedLabel
    ) {
      return false;
    }
  }
  return true;
};

interface DetectionHotspotsProps {
  imageId: number | null;
  imageUrl: string;
  mirrored?: boolean;
  shouldInferHotspots?: boolean;
  cachedDetection?: DetectionCacheEntry | null;
}

const DetectionHotspots = ({
  imageId,
  imageUrl,
  mirrored = false,
  shouldInferHotspots = true,
  cachedDetection,
}: DetectionHotspotsProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const setImageDetection = useCurationStore(
    (state) => state.setImageDetection
  );
  const resetImageState = useCurationStore((state) => state.resetImageState);
  const selectHotspot = useCurationStore((state) => state.selectHotspot);
  const selectCategory = useCurationStore((state) => state.selectCategory);
  const selectedHotspotId = useCurationStore((state) =>
    imageId !== null ? (state.images[imageId]?.selectedHotspotId ?? null) : null
  );
  const detectedObjects = useCurationStore((state) =>
    imageId !== null
      ? (state.images[imageId]?.detectedObjects ?? EMPTY_DETECTED_CODES)
      : EMPTY_DETECTED_CODES
  );
  const openSheet = useOpenCurationSheet();
  const categoriesQuery = useGeneratedCategoriesQuery(imageId ?? null);
  const pendingCategoryIdRef = useRef<number | null>(null);
  const lastSyncedHotspotsRef = useRef<FurnitureHotspot[] | null>(null);
  const lastDetectionsRef = useRef<ProcessedDetections | null>(null);
  const { variant } = useABTest();
  const { prefetchedDetections, saveEntry } = useDetectionCache(
    imageId,
    imageUrl,
    { initialEntry: cachedDetection ?? null }
  );
  const logDetectionEvent = (
    event: string,
    payload?: Record<string, unknown>,
    level: 'info' | 'warn' = 'info'
  ) => {
    logFurniturePipelineEvent(
      event,
      {
        imageId,
        imageUrl,
        ...payload,
      },
      { level }
    );
  };

  // 훅으로 로직 이동: refs/hotspots/isLoading/error 제공
  // 페이지 시나리오별로 추론 사용 여부 제어
  const handleInferenceComplete = useCallback(
    (result: ProcessedDetections, latestHotspots: FurnitureHotspot[]) => {
      lastDetectionsRef.current = result;
      saveEntry({
        processedDetections: result,
        hotspots: latestHotspots,
      });
    },
    [saveEntry]
  );

  useEffect(() => {
    if (!prefetchedDetections) return;
    lastDetectionsRef.current = prefetchedDetections;
  }, [prefetchedDetections]);

  useEffect(() => {
    lastDetectionsRef.current = null;
  }, [imageUrl]);

  // 훅 옵션 객체를 메모이제이션해 불필요한 재실행 차단
  const hotspotOptions = useMemo(
    () => ({
      prefetchedDetections,
      onInferenceComplete: handleInferenceComplete,
    }),
    [prefetchedDetections, handleInferenceComplete]
  );

  const { imgRef, containerRef, hotspots, isLoading, error } =
    useFurnitureHotspots(
      imageUrl,
      mirrored,
      shouldInferHotspots,
      hotspotOptions
    );
  const allowedCategories = categoriesQuery.data?.categories;

  // 서버 응답 순서를 신뢰해 detectedObjects 와 카테고리를 1:1 매칭
  const detectedCodeToCategoryId = useMemo(() => {
    return buildDetectedCodeToCategoryId(allowedCategories, detectedObjects);
  }, [allowedCategories, detectedObjects]);

  type DisplayHotspot = {
    hotspot: FurnitureHotspot;
    resolvedCode: FurnitureCategoryCode | null;
  };

  const displayHotspots: DisplayHotspot[] = useMemo(() => {
    // 서버가 허용한 카테고리와 매칭되는 핫스팟만 유지
    if (!allowedCategories || allowedCategories.length === 0) {
      return [];
    }
    return hotspots
      .map((hotspot) => {
        const resolvedCode = resolveFurnitureCode({
          finalLabel: hotspot.finalLabel,
          obj365Label: hotspot.label ?? null,
          refinedLabel: hotspot.refinedLabel,
          refinedConfidence: hotspot.confidence,
        });
        const categoryId = resolveCategoryIdForHotspot(
          hotspot,
          resolvedCode,
          allowedCategories,
          detectedCodeToCategoryId
        );
        if (!categoryId) return null;
        return { hotspot, resolvedCode };
      })
      .filter((item): item is DisplayHotspot => Boolean(item));
  }, [hotspots, allowedCategories, detectedCodeToCategoryId]);

  const hasHotspots = displayHotspots.length > 0;

  useEffect(() => {
    if (imageId === null) return;
    if (!shouldInferHotspots) {
      lastSyncedHotspotsRef.current = null;
      resetImageState(imageId);
      return;
    }
    if (isSameHotspotArray(lastSyncedHotspotsRef.current, hotspots)) {
      return;
    }
    lastSyncedHotspotsRef.current = hotspots;
    const rawDetectedCodes = mapHotspotsToDetectedObjects(hotspots);
    const detectedObjects = filterAllowedDetectedObjects(rawDetectedCodes, {
      stage: 'image-detection',
      imageId,
      hotspotCount: hotspots.length,
    });
    setImageDetection(imageId, {
      hotspots,
      detectedObjects,
    });
    const processedDetections = lastDetectionsRef.current;
    if (processedDetections) {
      saveEntry({
        processedDetections,
        hotspots,
        detectedObjects,
      });
      lastDetectionsRef.current = null;
    }
  }, [
    imageId,
    hotspots,
    setImageDetection,
    resetImageState,
    shouldInferHotspots,
    saveEntry,
  ]);

  useEffect(() => {
    lastSyncedHotspotsRef.current = null;
  }, [imageId]);

  // 이미지 URL이 변경되면 로드 상태 리셋
  useEffect(() => {
    setIsImageLoaded(false);
  }, [imageUrl]);

  const handleHotspotClick = (hotspot: FurnitureHotspot) => {
    if (imageId === null) return;
    const next =
      selectedHotspotId !== null && selectedHotspotId === hotspot.id
        ? null
        : hotspot.id;
    selectHotspot(imageId, next);
    if (next) {
      logResultImgClickBtnSpot(variant);
      logDetectionEvent('hotspot-selected', {
        hotspotId: hotspot.id,
        score: hotspot.score,
        confidence: hotspot.confidence,
        label: {
          final: hotspot.finalLabel,
          rawIndex: hotspot.label ?? null,
          refinedKey: hotspot.refinedLabel ?? null,
        },
        coords: { cx: hotspot.cx, cy: hotspot.cy },
      });
      // 요구사항: 해당 핫스팟이 바텀시트 카테고리에 존재하면 선택 + 바텀시트 확장
      const resolvedCode = resolveFurnitureCode({
        finalLabel: hotspot.finalLabel,
        obj365Label: hotspot.label ?? null,
        refinedLabel: hotspot.refinedLabel,
        refinedConfidence: hotspot.confidence,
      });
      const categoryId = resolveCategoryIdForHotspot(
        hotspot,
        resolvedCode,
        allowedCategories,
        detectedCodeToCategoryId
      );
      // 매핑 디버그 로그 항상 출력
      const allowed = categoriesQuery.data?.categories ?? [];
      const resolvedCategory = allowed.find((c) => c.id === categoryId);
      logDetectionEvent('hotspot-mapping', {
        hotspot: {
          finalLabel: hotspot.finalLabel,
          className: hotspot.className,
        },
        resolvedCode,
        allowedCategories: allowed.map((c) => ({
          id: c.id,
          name: c.categoryName,
        })),
        resolvedCategoryId: categoryId,
        resolvedCategoryName: resolvedCategory?.categoryName ?? null,
      });
      if (!categoryId) return;
      const inChips = categoriesQuery.data?.categories?.some(
        (c) => c.id === categoryId
      );
      if (inChips) {
        openSheet('mid');
        selectCategory(imageId, categoryId);
        pendingCategoryIdRef.current = null;
      } else {
        // 아직 카테고리 목록이 로딩되지 않았을 수 있어 후처리 예약
        pendingCategoryIdRef.current = categoryId;
        if (!categoriesQuery.isFetching) {
          categoriesQuery.refetch();
        }
      }
    } else {
      openSheet('collapsed');
      logDetectionEvent('hotspot-cleared', { hotspotId: hotspot.id });
    }
  };

  // 후처리: 카테고리 데이터 도착 후 보류 중인 선택 적용
  useEffect(() => {
    const imageIdVal = imageId;
    if (!imageIdVal) return;
    const pending = pendingCategoryIdRef.current;
    if (!pending) return;
    const has = categoriesQuery.data?.categories?.some((c) => c.id === pending);
    if (has) {
      openSheet('mid');
      selectCategory(imageIdVal, pending);
      pendingCategoryIdRef.current = null;
    }
  }, [categoriesQuery.data, imageId, openSheet, selectCategory]);

  if (error) {
    // 모델 로드 실패 시에도 이미지 자체는 보여주도록
    logDetectionEvent(
      'detection-model-error',
      {
        error:
          error instanceof Error
            ? { name: error.name, message: error.message }
            : error,
      },
      'warn'
    );
  }
  if (isLoading) {
    return (
      <div ref={containerRef} className={styles.container}>
        {!isImageLoaded && <div className={styles.skeleton} />}
        <img
          ref={imgRef}
          crossOrigin="anonymous"
          src={imageUrl}
          alt="generated"
          className={styles.image({ mirrored, loaded: isImageLoaded })}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.container}>
      {!isImageLoaded && <div className={styles.skeleton} />}
      <img
        ref={imgRef}
        crossOrigin="anonymous"
        src={imageUrl}
        alt="generated"
        className={styles.image({ mirrored, loaded: isImageLoaded })}
        onLoad={() => setIsImageLoaded(true)}
      />
      <div className={styles.overlay({ visible: hasHotspots })}>
        {displayHotspots.map(({ hotspot }) => (
          <button
            key={hotspot.id}
            className={styles.hotspot}
            style={{ left: hotspot.cx, top: hotspot.cy }}
            onClick={() => handleHotspotClick(hotspot)}
            aria-label={`hotspot ${hotspot.finalLabel ?? 'furniture'}`}
          >
            {selectedHotspotId === hotspot.id ? (
              <HotspotColor />
            ) : (
              <HotspotGray />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DetectionHotspots;
