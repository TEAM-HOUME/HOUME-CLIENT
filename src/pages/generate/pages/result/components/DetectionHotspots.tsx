// DetectionHotspots
// - 역할: 훅(useFurnitureHotspots)이 만든 가구 핫스팟을 렌더
// - 파이프라인 요약: Obj365 → 가구만 선별 → cabinet만 리파인 → 가구 전체 핫스팟 렌더
// - 비고: 스토어로 핫스팟 상태를 전달해 바텀시트와 연계
import { useEffect, useMemo } from 'react';

import { useFurnitureDashboardQuery } from '@pages/generate/hooks/useFurnitureCuration';
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
  const selectedHotspotId = useCurationStore((state) =>
    imageId !== null ? (state.images[imageId]?.selectedHotspotId ?? null) : null
  );
  const { data: dashboardData } = useFurnitureDashboardQuery();

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
    } else {
      console.info('[DetectionHotspots] 핫스팟 선택 해제(clear hotspot)', {
        id: hotspot.id,
      });
    }
  };

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
