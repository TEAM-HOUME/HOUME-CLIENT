import {
  DETECTION_MIN_CONFIDENCE,
  FALLBACK_MAX_CANDIDATES,
} from '@pages/generate/constants/detection';
import {
  describeObj365Index,
  hasFurnitureCodeForIndex,
} from '@pages/generate/constants/furnitureCategoryMapping';
import { toImageSpaceBBox } from '@pages/generate/utils/imageProcessing';
import { OBJ365_ALL_CLASSES } from '@pages/generate/utils/obj365AllClasses';
import { isCabinetShelfIndex } from '@pages/generate/utils/obj365Furniture';
import {
  refineFurnitureDetections,
  type RefinedFurnitureDetection,
} from '@pages/generate/utils/refineFurnitureDetections';

import type {
  DebugRect,
  FurnitureHotspot,
  HotspotContainerSize,
  HotspotImageMeta,
  RenderMetrics,
} from './furnitureHotspotState';
import type {
  Detection as FurnitureDetection,
  ProcessedDetections,
} from '@pages/generate/types/detection';

// ID 생성 시 bbox 좌표 정규화를 위한 소수점 자릿수
const HOTSPOT_ID_PRECISION = 3;
const MIN_BBOX_PIXELS = 8;

const formatKeyPart = (value: number) =>
  Number.isFinite(value) ? value.toFixed(HOTSPOT_ID_PRECISION) : 'NaN';

const hashString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = Math.imul(31, hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
};

const computeRankScore = (candidate: {
  confidence?: number;
  score?: number;
}) => {
  return candidate.score ?? 0;
};

const createHotspotId = (input: {
  bbox: [number, number, number, number];
  label?: number;
  refinedLabel?: string;
  confidence?: number;
  score?: number;
}) => {
  const identity = [
    input.label ?? 'none',
    input.refinedLabel ?? 'none',
    ...input.bbox.map((value) => formatKeyPart(value)),
    formatKeyPart(input.confidence ?? input.score ?? 0),
  ].join('|');
  return hashString(identity);
};

const selectEffectiveHotspots = (candidates: FurnitureHotspot[]) => {
  const passing = candidates.filter(
    (candidate) => computeRankScore(candidate) >= DETECTION_MIN_CONFIDENCE
  );
  if (passing.length > 0) return passing;
  return [...candidates]
    .sort((a, b) => computeRankScore(b) - computeRankScore(a))
    .slice(0, Math.min(FALLBACK_MAX_CANDIDATES, candidates.length));
};

const isRefinedDetection = (
  detection: FurnitureDetection | RefinedFurnitureDetection
): detection is RefinedFurnitureDetection =>
  'refinedLabel' in detection && 'confidence' in detection;

const createHotspotFromDetection = (
  detection: FurnitureDetection | RefinedFurnitureDetection
): FurnitureHotspot => {
  const refinedLabel = isRefinedDetection(detection)
    ? detection.refinedLabel
    : undefined;
  const refinedLabelEn = isRefinedDetection(detection)
    ? detection.refinedLabelEn
    : undefined;
  const confidence = isRefinedDetection(detection)
    ? detection.confidence
    : undefined;
  const baseClass =
    detection.className ??
    (typeof detection.label === 'number'
      ? (OBJ365_ALL_CLASSES[detection.label] ?? undefined)
      : undefined);
  const finalLabel = refinedLabelEn ?? baseClass ?? null;

  return {
    bbox: detection.bbox,
    score: detection.score,
    label: detection.label,
    className: finalLabel ?? detection.className,
    refinedLabel,
    refinedLabelEn,
    finalLabel,
    confidence,
    id: createHotspotId({
      bbox: detection.bbox,
      label: detection.label,
      refinedLabel,
      confidence,
      score: detection.score,
    }),
    cx: 0,
    cy: 0,
  };
};

export type FilteredOutDetection = {
  label: number | null;
  className: string;
  score: number;
};

export type HotspotPipelineDebug = {
  filteredOut: FilteredOutDetection[];
  pixelDetections: FurnitureDetection[];
  debugCandidates: Array<{
    id: number;
    finalLabel: string | null;
    refinedKey: string | null;
    rawLabel: string | null;
    score: number | null;
    confidence: number | null;
    bbox: [number, number, number, number];
  }>;
  labelSummary: Array<{
    id: number;
    finalLabel: string | null;
    refinedLabel: string | null;
    rawLabelIndex: number | null;
  }>;
  refinedDetections: RefinedFurnitureDetection[];
};

export type BuildHotspotsResult = {
  imageMeta: HotspotImageMeta;
  hotspots: FurnitureHotspot[];
  hotspotCandidates: FurnitureHotspot[];
  debug: HotspotPipelineDebug;
  cabinetCount: number;
  refinedCount: number;
  fallbackTriggered: boolean;
};

export const buildHotspotsPipeline = (
  imageEl: HTMLImageElement,
  inference: ProcessedDetections
): BuildHotspotsResult => {
  const natW = imageEl.naturalWidth || imageEl.width;
  const natH = imageEl.naturalHeight || imageEl.height;

  const pixelDetections: FurnitureDetection[] = inference.detections.map(
    (det) => {
      const { x, y, w, h } = toImageSpaceBBox(imageEl, det.bbox);
      return {
        ...det,
        bbox: [x, y, w, h] as [number, number, number, number],
      };
    }
  );

  const filteredOut: FilteredOutDetection[] = [];
  const allowedDetections = pixelDetections.filter((det) => {
    if (!hasFurnitureCodeForIndex(det.label ?? null)) {
      filteredOut.push({
        label: det.label ?? null,
        className: det.className ?? describeObj365Index(det.label),
        score: det.score,
      });
      return false;
    }
    return true;
  });

  const cabinet = allowedDetections.filter((d) => {
    if (!isCabinetShelfIndex(d.label)) return false;
    const [, , w, h] = d.bbox;
    return w >= MIN_BBOX_PIXELS && h >= MIN_BBOX_PIXELS;
  });
  const others = allowedDetections.filter((d) => !isCabinetShelfIndex(d.label));

  const { refinedDetections } = cabinet.length
    ? refineFurnitureDetections(cabinet, { width: natW, height: natH })
    : { refinedDetections: [] as RefinedFurnitureDetection[] };

  let cabinetPipeline: Array<FurnitureDetection | RefinedFurnitureDetection> =
    refinedDetections;
  let fallbackTriggered = false;
  if (cabinet.length > 0 && refinedDetections.length === 0) {
    fallbackTriggered = true;
    cabinetPipeline = cabinet.map((det) => ({
      ...det,
      className:
        det.className ??
        (typeof det.label === 'number'
          ? (OBJ365_ALL_CLASSES[det.label] ?? undefined)
          : undefined),
    }));
  }

  const combinedDetections: Array<
    FurnitureDetection | RefinedFurnitureDetection
  > = [...cabinetPipeline, ...others];
  const hotspotCandidates = combinedDetections.map((det) =>
    createHotspotFromDetection(det)
  );

  const debugCandidates = hotspotCandidates.map((candidate) => {
    const labelIndex = candidate.label ?? null;
    const rawLabel =
      labelIndex !== null && OBJ365_ALL_CLASSES[labelIndex]
        ? OBJ365_ALL_CLASSES[labelIndex]
        : null;
    return {
      id: candidate.id,
      finalLabel: candidate.finalLabel,
      refinedKey: candidate.refinedLabel ?? null,
      rawLabel,
      score: candidate.score ?? null,
      confidence: candidate.confidence ?? null,
      bbox: candidate.bbox,
    };
  });

  const labelSummary = hotspotCandidates.map((candidate) => ({
    id: candidate.id,
    finalLabel: candidate.finalLabel,
    refinedLabel: candidate.refinedLabel ?? null,
    rawLabelIndex: candidate.label ?? null,
  }));

  const effective = hotspotCandidates.length
    ? selectEffectiveHotspots(hotspotCandidates)
    : [];

  return {
    imageMeta: { width: natW, height: natH },
    hotspots: effective,
    hotspotCandidates,
    debug: {
      filteredOut,
      pixelDetections,
      debugCandidates,
      labelSummary,
      refinedDetections,
    },
    cabinetCount: cabinet.length,
    refinedCount: refinedDetections.length,
    fallbackTriggered,
  };
};

export const projectHotspots = (
  hotspots: FurnitureHotspot[],
  renderMetrics: RenderMetrics | null,
  containerSize: HotspotContainerSize,
  mirrored: boolean
): { projectedHotspots: FurnitureHotspot[]; debugRects: DebugRect[] } => {
  if (!renderMetrics) {
    return { projectedHotspots: [], debugRects: [] };
  }
  const {
    offsetX,
    offsetY,
    scaleX,
    scaleY,
    width: renderW,
    height: renderH,
  } = renderMetrics;
  if (scaleX === 0 || scaleY === 0) {
    return { projectedHotspots: [], debugRects: [] };
  }
  const containerW = containerSize.width || renderW;
  const containerH = containerSize.height || renderH;

  const debugRects = hotspots.map((det) => {
    const [x, y, w, h] = det.bbox;
    let left = offsetX + x * scaleX;
    if (mirrored) {
      left = offsetX + renderW - (x + w) * scaleX;
    }
    const top = offsetY + y * scaleY;
    const width = w * scaleX;
    const height = h * scaleY;
    return {
      id: det.id,
      left: Math.min(containerW, Math.max(0, left)),
      top: Math.min(containerH, Math.max(0, top)),
      width: Math.max(1, Math.min(width, containerW)),
      height: Math.max(1, Math.min(height, containerH)),
      label: det.className ?? null,
    };
  });

  const projectedHotspots = hotspots.map((det) => {
    const [x, y, w, h] = det.bbox;
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    let cx = offsetX + centerX * scaleX;
    if (mirrored) {
      cx = offsetX + renderW - centerX * scaleX;
    }
    const cy = offsetY + centerY * scaleY;
    const clampedCx = Math.min(containerW, Math.max(0, cx));
    const clampedCy = Math.min(containerH, Math.max(0, cy));
    return { ...det, cx: clampedCx, cy: clampedCy };
  });

  return { projectedHotspots, debugRects };
};

export const computeRenderMetrics = (
  imageEl: HTMLImageElement | null,
  containerEl: HTMLDivElement | null
): RenderMetrics | null => {
  if (!imageEl || !containerEl) return null;
  const imgRect = imageEl.getBoundingClientRect();
  const containerRect = containerEl.getBoundingClientRect();
  const naturalWidth = imageEl.naturalWidth || imageEl.width;
  const naturalHeight = imageEl.naturalHeight || imageEl.height;
  if (
    !naturalWidth ||
    !naturalHeight ||
    imgRect.width === 0 ||
    imgRect.height === 0
  ) {
    return null;
  }
  return {
    offsetX: imgRect.left - containerRect.left,
    offsetY: imgRect.top - containerRect.top,
    scaleX: imgRect.width / naturalWidth,
    scaleY: imgRect.height / naturalHeight,
    width: imgRect.width,
    height: imgRect.height,
  };
};
