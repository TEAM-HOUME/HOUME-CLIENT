// DetectionHotspots
// - 역할: 훅(useFurnitureHotspots)이 만든 가구 핫스팟을 렌더
// - 파이프라인 요약: Obj365 → 가구만 선별 → cabinet만 리파인 → 가구 전체 핫스팟 렌더
// - 비고: 스토어로 핫스팟 상태를 전달해 바텀시트와 연계
import { useEffect, useMemo, useRef } from 'react';

import {
  resolveFurnitureCode,
  toFurnitureCategoryCode,
  type FurnitureCategoryCode,
} from '@pages/generate/constants/furnitureCategoryMapping';
import {
  useFurnitureDashboardQuery,
  useGeneratedCategoriesQuery,
} from '@pages/generate/hooks/useFurnitureCuration';
import { useOpenCurationSheet } from '@pages/generate/hooks/useFurnitureCuration';
import { useFurnitureHotspots } from '@pages/generate/hooks/useFurnitureHotspots';
import { useCurationStore } from '@pages/generate/stores/useCurationStore';
import {
  filterAllowedDetectedObjects,
  mapHotspotsToDetectedObjects,
} from '@pages/generate/utils/detectedObjectMapper';
import { logFurniturePipelineEvent } from '@pages/generate/utils/furniturePipelineMonitor';
import HotspotColor from '@shared/assets/icons/icnHotspotColor.svg?react';
import HotspotGray from '@shared/assets/icons/icnHotspotGray.svg?react';

import * as styles from './DetectionHotspots.css.ts';

import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';
import type { FurnitureCategoryResponse } from '@pages/generate/types/furniture';

interface DetectionHotspotsProps {
  imageId: number | null;
  imageUrl: string;
  mirrored?: boolean;
  shouldInferHotspots?: boolean;
}

const DetectionHotspots = ({
  imageId,
  imageUrl,
  mirrored = false,
  shouldInferHotspots = true,
}: DetectionHotspotsProps) => {
  const setImageDetection = useCurationStore(
    (state) => state.setImageDetection
  );
  const resetImageState = useCurationStore((state) => state.resetImageState);
  const selectHotspot = useCurationStore((state) => state.selectHotspot);
  const selectCategory = useCurationStore((state) => state.selectCategory);
  const selectedHotspotId = useCurationStore((state) =>
    imageId !== null ? (state.images[imageId]?.selectedHotspotId ?? null) : null
  );
  const { data: dashboardData } = useFurnitureDashboardQuery();
  const openSheet = useOpenCurationSheet();
  const categoriesQuery = useGeneratedCategoriesQuery(imageId ?? null);
  const pendingCategoryIdRef = useRef<number | null>(null);
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
  const { imgRef, containerRef, hotspots, isLoading, error } =
    useFurnitureHotspots(imageUrl, mirrored, shouldInferHotspots);
  const allowedCategories = categoriesQuery.data?.categories;

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
          allowedCategories
        );
        if (!categoryId) return null;
        return { hotspot, resolvedCode };
      })
      .filter((item): item is DisplayHotspot => Boolean(item));
  }, [hotspots, allowedCategories, dashboardData?.categories]);

  const hasHotspots = displayHotspots.length > 0;

  useEffect(() => {
    if (imageId === null) return;
    if (!shouldInferHotspots) {
      resetImageState(imageId);
      return;
    }
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
  }, [
    imageId,
    hotspots,
    setImageDetection,
    resetImageState,
    shouldInferHotspots,
  ]);

  // 핫스팟 라벨 → 카테고리 ID 해석 유틸
  const resolveCategoryIdForHotspot = (
    hotspot: FurnitureHotspot,
    resolvedCode: FurnitureCategoryCode | null,
    allowedCategories: FurnitureCategoryResponse[] | undefined
  ): number | null => {
    // 대시보드 코드 테이블과 서버 응답 ID를 동시에 교차 확인
    const groups = dashboardData?.categories ?? [];
    if (!groups || groups.length === 0) return null;
    // 매핑 테이블: code → categoryId
    const codeToCategoryId = new Map<string, number>();
    groups.forEach((g) => {
      g.furnitures.forEach((f) => {
        const code = toFurnitureCategoryCode(f.code);
        if (!code) return;
        codeToCategoryId.set(code, g.categoryId);
      });
    });
    // 이미지에 실제로 존재하는 카테고리만 허용
    const allowedIdSet = new Set(allowedCategories?.map((c) => c.id));

    // 후보군: Obj365/리파인 조합으로 확정된 단일 코드만 사용
    if (resolvedCode) {
      const byCode = codeToCategoryId.get(resolvedCode);
      if (byCode && allowedIdSet.has(byCode)) {
        return byCode;
      }
    }

    // 1차: group.categoryId 가 allowed 에 존재하는지 검사
    // 2차: 레이블 텍스트 기반 매칭 — finalLabel 과 서버 카테고리명 비교
    const nameToAllowedId = new Map<string, number>();
    (allowedCategories ?? []).forEach((c) => {
      const n = (c.categoryName ?? '').toString().trim();
      if (!n) return;
      nameToAllowedId.set(n.toUpperCase(), c.id);
      nameToAllowedId.set(n.replaceAll(' ', '_').toUpperCase(), c.id);
    });
    const fallbackLabels = [hotspot.finalLabel ?? '', hotspot.className ?? '']
      .flatMap((label) =>
        label
          .split('/')
          .map((part) => part.trim())
          .filter(Boolean)
      )
      .map((label) => label.toUpperCase());
    for (const label of fallbackLabels) {
      const direct = nameToAllowedId.get(label);
      if (direct) return direct;
    }

    return null;
  };

  const handleHotspotClick = (hotspot: FurnitureHotspot) => {
    if (imageId === null) return;
    const next =
      selectedHotspotId !== null && selectedHotspotId === hotspot.id
        ? null
        : hotspot.id;
    selectHotspot(imageId, next);
    if (next) {
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
        allowedCategories
      );
      // 매핑 디버그 로그 항상 출력
      const allowed = categoriesQuery.data?.categories ?? [];
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
      });
      if (!categoryId) return;
      const inChips = categoriesQuery.data?.categories?.some(
        (c) => c.id === categoryId
      );
      if (inChips) {
        openSheet('expanded');
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
      openSheet('expanded');
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
        <img
          ref={imgRef}
          crossOrigin="anonymous"
          src={imageUrl}
          alt="generated"
          className={styles.image({ mirrored })}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <img
        ref={imgRef}
        crossOrigin="anonymous"
        src={imageUrl}
        alt="generated"
        className={styles.image({ mirrored })}
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
