// 감지 레이블을 API 파라미터 값으로 매핑하는 유틸
import {
  filterAllowedFurnitureCodes,
  normalizeFurnitureLabelForMap,
  resolveFurnitureCodes,
  toFurnitureCategoryCode,
  type FurnitureCategoryCode,
} from '@pages/generate/constants/furnitureCategoryMapping';
import { reportFurniturePipelineWarning } from '@pages/generate/utils/furniturePipelineMonitor';

import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';
import type { FurnitureCategoryGroup } from '@pages/generate/types/furniture';

type FurnitureLabelMap = Record<string, FurnitureCategoryCode[]>;

// 대시보드 응답을 매핑 테이블로 변환
// 대시보드가 내려주는 라벨과 서버 코드를 연결
export const buildDashboardLabelMap = (
  groups: FurnitureCategoryGroup[] | undefined
) => {
  if (!groups) return {};
  const map: FurnitureLabelMap = {};
  groups.forEach((group) => {
    group.furnitures.forEach((item) => {
      const code = toFurnitureCategoryCode(item.code);
      if (!code) return;
      const labelKey = normalizeFurnitureLabelForMap(item.label);
      if (!labelKey) return;
      const existing = map[labelKey] ?? [];
      map[labelKey] = filterAllowedFurnitureCodes([...existing, code]);
    });
    const groupKeys = [
      normalizeFurnitureLabelForMap(group.nameEng),
      normalizeFurnitureLabelForMap(group.nameKr),
    ].filter(Boolean) as string[];
    const groupCodes = filterAllowedFurnitureCodes(
      group.furnitures
        .map((item) => toFurnitureCategoryCode(item.code))
        .filter((code): code is FurnitureCategoryCode => Boolean(code))
    );
    if (groupCodes.length === 0) return;
    groupKeys.forEach((key) => {
      const existing = map[key] ?? [];
      map[key] = filterAllowedFurnitureCodes([...existing, ...groupCodes]);
    });
  });
  return map;
};

// 감지된 핫스팟을 API 파라미터 배열로 변환
// 핫스팟 라벨을 허용 FurnitureCategoryCode 배열로 변환
export const mapHotspotsToDetectedObjects = (
  hotspots: FurnitureHotspot[],
  dynamicMap: FurnitureLabelMap
) => {
  const result = new Set<FurnitureCategoryCode>();
  const dropped: Array<{
    hotspotId: number;
    finalLabel: string | null;
  }> = [];
  hotspots.forEach((hotspot) => {
    const normalized = normalizeFurnitureLabelForMap(hotspot.finalLabel);
    const dynamicCodes =
      (normalized ? dynamicMap[normalized] : undefined) ?? [];
    const resolved = resolveFurnitureCodes({
      finalLabel: hotspot.finalLabel,
      obj365Label: hotspot.label ?? null,
      refinedLabel: hotspot.refinedLabel,
      dynamicCodes,
    });
    if (resolved.length === 0) {
      dropped.push({
        hotspotId: hotspot.id,
        finalLabel: hotspot.finalLabel ?? null,
      });
      return;
    }
    resolved.forEach((code) => result.add(code));
  });
  if (dropped.length > 0) {
    console.warn('[DetectedObjectMapper] 허용되지 않은 finalLabel 제외', {
      dropped,
    });
    reportFurniturePipelineWarning('furniture-final-label-drop', { dropped });
  }
  const allowed = filterAllowedDetectedObjects(Array.from(result), {
    stage: 'mapHotspots',
    hotspotCount: hotspots.length,
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
    console.warn('[DetectedObjectMapper] 허용 코드 필터 적용', {
      stage: context?.stage ?? 'unknown',
      imageId: context?.imageId ?? null,
      hotspotCount: context?.hotspotCount ?? 0,
      before: codes,
      after: filtered,
    });
    reportFurniturePipelineWarning('furniture-allowed-code-filter', {
      stage: context?.stage ?? 'unknown',
      before: codes,
      after: filtered,
    });
  }
  return filtered;
};
