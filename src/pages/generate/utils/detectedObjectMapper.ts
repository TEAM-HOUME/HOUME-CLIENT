// 감지 레이블을 API 파라미터 값으로 매핑하는 유틸
import {
  filterAllowedFurnitureCodes,
  resolveFurnitureCode,
  type FurnitureCategoryCode,
} from '@pages/generate/constants/furnitureCategoryMapping';
import { logFurniturePipelineEvent } from '@pages/generate/utils/furniturePipelineMonitor';

import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';

// 감지된 핫스팟을 API 파라미터 배열로 변환
// 핫스팟 라벨을 허용 FurnitureCategoryCode 배열로 변환
export const mapHotspotsToDetectedObjects = (hotspots: FurnitureHotspot[]) => {
  const result = new Set<FurnitureCategoryCode>();
  const dropped: Array<{
    hotspotId: number;
    finalLabel: string | null;
  }> = [];
  hotspots.forEach((hotspot) => {
    const code = resolveFurnitureCode({
      finalLabel: hotspot.finalLabel,
      obj365Label: hotspot.label ?? null,
      refinedLabel: hotspot.refinedLabel,
      refinedConfidence: hotspot.confidence,
    });
    if (!code) {
      dropped.push({
        hotspotId: hotspot.id,
        finalLabel: hotspot.finalLabel ?? null,
      });
      return;
    }
    result.add(code);
  });
  if (dropped.length > 0) {
    logFurniturePipelineEvent(
      'furniture-final-label-drop',
      { dropped },
      { level: 'warn' }
    );
  }
  const allowed = filterAllowedDetectedObjects(Array.from(result), {
    stage: 'mapHotspots',
    hotspotCount: hotspots.length,
  });
  logFurniturePipelineEvent('detected-object-map', {
    stage: 'mapHotspots',
    hotspotCount: hotspots.length,
    detectedCodes: allowed,
  });
  return allowed;
};

// Request 직전에 허용 코드만 남기도록 강제
export const filterAllowedDetectedObjects = (
  codes: FurnitureCategoryCode[],
  context?: {
    stage?: string;
    imageId?: number | null;
    hotspotCount?: number;
  }
) => {
  const filtered = filterAllowedFurnitureCodes(codes);
  if (filtered.length !== codes.length) {
    logFurniturePipelineEvent(
      'furniture-allowed-code-filter',
      {
        stage: context?.stage ?? 'unknown',
        imageId: context?.imageId ?? null,
        hotspotCount: context?.hotspotCount ?? 0,
        before: codes,
        after: filtered,
      },
      { level: 'warn' }
    );
  }
  return filtered;
};
