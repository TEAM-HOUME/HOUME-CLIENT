// DetectionHotspots
// - 역할: 훅(useFurnitureHotspots)이 만든 가구 핫스팟을 렌더
// - 파이프라인 요약: Obj365 → 가구만 선별 → cabinet만 리파인 → 가구 전체 핫스팟 렌더
// - 비고: 스토어로 핫스팟 상태를 전달해 바텀시트와 연계
import { useEffect, useMemo, useRef } from 'react';

import {
  useFurnitureDashboardQuery,
  useGeneratedCategoriesQuery,
} from '@pages/generate/hooks/useFurnitureCuration';
import { useOpenCurationSheet } from '@pages/generate/hooks/useFurnitureCuration';
import { useFurnitureHotspots } from '@pages/generate/hooks/useFurnitureHotspots';
import { useCurationStore } from '@pages/generate/stores/useCurationStore';
import {
  buildDashboardLabelMap,
  mapHotspotsToDetectedObjects,
} from '@pages/generate/utils/detectedObjectMapper';
import HotspotColor from '@shared/assets/icons/icnHotspotColor.svg?react';
import HotspotGray from '@shared/assets/icons/icnHotspotGray.svg?react';

import * as styles from './DetectionHotspots.css.ts';

import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';

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

  const dynamicLabelMap = useMemo(
    () => buildDashboardLabelMap(dashboardData?.categories),
    [dashboardData?.categories]
  );

  // 훅으로 로직 이동: refs/hotspots/isLoading/error 제공
  // 페이지 시나리오별로 추론 사용 여부 제어
  const { imgRef, containerRef, hotspots, isLoading, error } =
    useFurnitureHotspots(imageUrl, mirrored, shouldInferHotspots);
  const hasHotspots = hotspots.length > 0;

  useEffect(() => {
    if (imageId === null) return;
    if (!shouldInferHotspots) {
      resetImageState(imageId);
      return;
    }
    const detectedObjects = mapHotspotsToDetectedObjects(
      hotspots,
      dynamicLabelMap
    );
    setImageDetection(imageId, {
      hotspots,
      detectedObjects,
    });
  }, [
    imageId,
    hotspots,
    dynamicLabelMap,
    setImageDetection,
    resetImageState,
    shouldInferHotspots,
  ]);

  // 핫스팟 라벨 → 카테고리 ID 해석 유틸
  const resolveCategoryIdForHotspot = (
    hotspot: FurnitureHotspot
  ): number | null => {
    const groups = dashboardData?.categories ?? [];
    if (!groups || groups.length === 0) return null;
    // 매핑 테이블: code → categoryId, groupNameEng(upper) → categoryId
    const codeToCategoryId = new Map<string, number>();
    const nameToCategoryId = new Map<string, number>();
    groups.forEach((g) => {
      nameToCategoryId.set(g.nameEng.toUpperCase(), g.categoryId);
      g.furnitures.forEach((f) =>
        codeToCategoryId.set(f.code.toUpperCase(), g.categoryId)
      );
    });
    // 후보군: 동적/내장 매퍼를 모두 활용해 후보 문자열 생성
    const candidatesText = mapHotspotsToDetectedObjects(
      [hotspot],
      dynamicLabelMap
    );
    const candidates: number[] = [];
    candidatesText.forEach((text) => {
      const raw = (text ?? '').toString().trim();
      if (!raw) return;
      const uppers = [
        raw.toUpperCase(),
        raw.replaceAll(' ', '_').toUpperCase(),
      ];
      uppers.forEach((upper) => {
        const byName = nameToCategoryId.get(upper);
        if (byName) candidates.push(byName);
        const byCode = codeToCategoryId.get(upper);
        if (byCode) candidates.push(byCode);
        // 슬래시 구분자 보조 처리(MONITOR/TV → MONITOR, TV)
        if (upper.includes('/')) {
          upper.split('/').forEach((part) => {
            const p = part.trim();
            if (!p) return;
            const byName2 = nameToCategoryId.get(p);
            if (byName2) candidates.push(byName2);
            const byCode2 = codeToCategoryId.get(p);
            if (byCode2) candidates.push(byCode2);
          });
        }
      });
    });
    // 이미지에 실제로 존재하는 카테고리만 허용
    const allowedCategories = categoriesQuery.data?.categories ?? [];
    const allowedIdSet = new Set(allowedCategories.map((c) => c.id));

    // 1차: group.categoryId 가 allowed 에 존재하는지 검사
    const foundById = candidates.find((id) => allowedIdSet.has(id));
    if (foundById) return foundById;

    // 2차: 이름 기반 매칭 — allowed.categoryName 과 group.nameKr/nameEng 비교
    // allowed 리스트를 빠르게 조회하기 위해 매핑 구성
    const nameToAllowedId = new Map<string, number>();
    allowedCategories.forEach((c) => {
      const n = (c.categoryName ?? '').toString().trim();
      if (!n) return;
      nameToAllowedId.set(n.toUpperCase(), c.id);
      nameToAllowedId.set(n.replaceAll(' ', '_').toUpperCase(), c.id);
    });
    for (const g of groups) {
      // 후보 텍스트가 해당 그룹명과 연관되는지 확인
      const gEngUpper = g.nameEng?.toUpperCase?.();
      const gEngUnderscore = gEngUpper?.replaceAll(' ', '_');
      const gKrUpper = g.nameKr?.toUpperCase?.();
      const related = [gEngUpper, gEngUnderscore, gKrUpper].filter(
        Boolean
      ) as string[];
      // 후보군 텍스트 일부가 그룹명과 일치할 경우 allowed 에 같은 이름이 있는지 확인
      const hit = candidatesText.some((t) => {
        const u = t.toUpperCase();
        return related.some((r) => u.includes(r));
      });
      if (hit) {
        for (const key of related) {
          const mapped = nameToAllowedId.get(key);
          if (mapped) return mapped;
        }
      }
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
      console.info('[DetectionHotspots] 활성 핫스팟(active hotspot)', {
        id: hotspot.id,
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
      const categoryId = resolveCategoryIdForHotspot(hotspot);
      // 매핑 디버그 로그 항상 출력
      const allowed = categoriesQuery.data?.categories ?? [];
      const candidatesText = mapHotspotsToDetectedObjects(
        [hotspot],
        dynamicLabelMap
      );
      console.info('[DetectionHotspots] mapping debug', {
        hotspot: {
          finalLabel: hotspot.finalLabel,
          className: hotspot.className,
        },
        candidatesText,
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
      console.info('[DetectionHotspots] 핫스팟 선택 해제(clear hotspot)', {
        id: hotspot.id,
      });
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
    console.warn('[Detection] model error:', error);
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
        {hotspots.map((hotspot: FurnitureHotspot) => (
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
