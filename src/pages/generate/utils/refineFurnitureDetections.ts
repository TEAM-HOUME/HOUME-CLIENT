import {
  FURNITURE_CATEGORY_LABELS,
  type FurnitureCategory,
} from './furnitureCategories';
import { isCabinetShelfIndex } from './obj365Furniture';

import type { Detection } from '@pages/generate/types/detection';

export { FURNITURE_CATEGORY_LABELS } from './furnitureCategories';
export type { FurnitureCategory } from './furnitureCategories';

export interface FurnitureImageMeta {
  width: number;
  height: number;
}

export interface FurnitureFeatures {
  widthRatio: number;
  heightRatio: number;
  areaRatio: number;
  aspectRatio: number;
  verticalAspect: number;
  centerXRatio: number;
  centerYRatio: number;
  topRatio: number;
  bottomRatio: number;
  leftRatio: number;
  rightRatio: number;
  touchesFloor: boolean;
  touchesCeiling: boolean;
  touchesLeftWall: boolean;
  touchesRightWall: boolean;
}

export interface FurnitureRefinementOptions {
  detectionScoreExponent: number;
  ambiguousPrior: number;
  minCategoryFloor: number;
  floorContactPadding: number;
  ceilingContactPadding: number;
  edgeContactThreshold: number;
}

export interface FurnitureRefinementContext {
  floorLine: number;
  ceilingLine: number;
  medianWidthRatio: number;
  medianHeightRatio: number;
}

export interface RefinedFurnitureDetection extends Detection {
  refinedLabel: FurnitureCategory;
  refinedKoLabel: string;
  confidence: number;
  probabilities: Record<FurnitureCategory, number>;
  features: FurnitureFeatures;
  contributions: Record<FurnitureCategory, Record<string, number>>;
}

const DEFAULT_OPTIONS: FurnitureRefinementOptions = {
  detectionScoreExponent: 0.7,
  ambiguousPrior: 0.12,
  minCategoryFloor: 1e-4,
  floorContactPadding: 0.08,
  ceilingContactPadding: 0.04,
  edgeContactThreshold: 0.04,
};

type InternalFeatures = FurnitureFeatures & {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type CategoryComputation = {
  key: FurnitureCategory;
  compute: (
    features: FurnitureFeatures,
    context: FurnitureRefinementContext,
    baseScore: number,
    options: FurnitureRefinementOptions
  ) => { raw: number; contributions: Record<string, number> };
};

const CATEGORY_DEFINITIONS: CategoryComputation[] = [
  {
    key: 'lowerCabinet',
    compute: (f, context, baseScore, options) => {
      const contributions = {
        bottomContact: rampUp(
          f.bottomRatio,
          Math.max(context.floorLine - options.floorContactPadding, 0.72),
          1
        ),
        heightBand: bandPass(f.heightRatio, 0.22, 0.48),
        lowerPlacement: rampUp(f.centerYRatio, 0.55, 0.9),
        verticalBalance: rampDown(f.verticalAspect, 2.5, 5.5),
        topClearance: rampUp(f.topRatio, 0.35, 0.7),
      };
      const score = weightedAverage([
        { weight: 0.3, score: contributions.bottomContact },
        { weight: 0.25, score: contributions.heightBand },
        { weight: 0.2, score: contributions.lowerPlacement },
        { weight: 0.15, score: contributions.verticalBalance },
        { weight: 0.1, score: contributions.topClearance },
      ]);
      return { raw: score * baseScore, contributions };
    },
  },
  {
    key: 'upperCabinet',
    compute: (f, context, baseScore, options) => {
      const contributions = {
        ceilingProximity: rampDown(
          f.topRatio,
          Math.max(context.ceilingLine - options.ceilingContactPadding, 0),
          Math.min(context.ceilingLine + 0.12, 0.25)
        ),
        detachedFromFloor: rampDown(f.bottomRatio, 0.45, 0.7),
        compactHeight: bandPass(f.heightRatio, 0.18, 0.42),
        upperPlacement: rampDown(f.centerYRatio, 0.3, 0.45),
        widthModeration: bandPass(f.widthRatio, 0.05, 0.18),
      };
      const score = weightedAverage([
        { weight: 0.3, score: contributions.ceilingProximity },
        { weight: 0.25, score: contributions.detachedFromFloor },
        { weight: 0.2, score: contributions.compactHeight },
        { weight: 0.15, score: contributions.upperPlacement },
        { weight: 0.1, score: contributions.widthModeration },
      ]);
      return { raw: score * baseScore, contributions };
    },
  },
  {
    key: 'wardrobe',
    compute: (f, context, baseScore, options) => {
      const contributions = {
        tallSilhouette: rampUp(f.heightRatio, 0.52, 0.85),
        floorContact: rampUp(
          f.bottomRatio,
          Math.max(context.floorLine - options.floorContactPadding, 0.72),
          1
        ),
        ceilingReach: rampDown(f.topRatio, 0.04, 0.2),
        slimWidth: rampDown(f.aspectRatio, 0.28, 0.58),
        verticalDominance: rampUp(f.verticalAspect, 3, 7),
      };
      const score = weightedAverage([
        { weight: 0.3, score: contributions.tallSilhouette },
        { weight: 0.25, score: contributions.floorContact },
        { weight: 0.2, score: contributions.ceilingReach },
        { weight: 0.15, score: contributions.slimWidth },
        { weight: 0.1, score: contributions.verticalDominance },
      ]);
      return { raw: score * baseScore, contributions };
    },
  },
  {
    key: 'builtInCloset',
    compute: (f, context, baseScore) => {
      const contributions = {
        spansWidth: rampUp(
          f.widthRatio,
          Math.max(context.medianWidthRatio, 0.18),
          0.55
        ),
        touchesWalls: clamp01(
          (f.touchesLeftWall ? 0.5 : 0) + (f.touchesRightWall ? 0.5 : 0)
        ),
        fullHeight: rampUp(f.heightRatio, 0.6, 0.9),
        shallowAspect: rampDown(f.aspectRatio, 0.35, 0.6),
        coverage: rampUp(f.areaRatio, 0.06, 0.18),
      };
      const score = weightedAverage([
        { weight: 0.25, score: contributions.spansWidth },
        { weight: 0.25, score: contributions.touchesWalls },
        { weight: 0.2, score: contributions.fullHeight },
        { weight: 0.15, score: contributions.shallowAspect },
        { weight: 0.15, score: contributions.coverage },
      ]);
      return { raw: score * baseScore, contributions };
    },
  },
  {
    key: 'chestOfDrawers',
    compute: (f, _context, baseScore) => {
      const contributions = {
        compactHeight: rampDown(f.heightRatio, 0.12, 0.3),
        nearFloor: rampUp(f.bottomRatio, 0.65, 0.98),
        proportion: bandPass(f.aspectRatio, 0.45, 1.0),
        localized: bandPass(f.centerYRatio, 0.55, 0.9),
        verticalBalance: rampDown(f.verticalAspect, 2.0, 3.5),
      };
      const score = weightedAverage([
        { weight: 0.28, score: contributions.compactHeight },
        { weight: 0.27, score: contributions.nearFloor },
        { weight: 0.2, score: contributions.proportion },
        { weight: 0.15, score: contributions.localized },
        { weight: 0.1, score: contributions.verticalBalance },
      ]);
      return { raw: score * baseScore, contributions };
    },
  },
  {
    key: 'storageCabinet',
    compute: (f, context, baseScore, options) => {
      const contributions = {
        midHeight: bandPass(f.heightRatio, 0.25, 0.55),
        floorAnchor: rampUp(
          f.bottomRatio,
          Math.max(context.floorLine - options.floorContactPadding, 0.6),
          0.98
        ),
        widthStability: bandPass(f.widthRatio, 0.08, 0.25),
        notCeiling: rampDown(f.topRatio, 0.15, 0.4),
        balancedAspect: rampDown(f.verticalAspect, 3.5, 5.5),
      };
      const score = weightedAverage([
        { weight: 0.28, score: contributions.midHeight },
        { weight: 0.22, score: contributions.floorAnchor },
        { weight: 0.2, score: contributions.widthStability },
        { weight: 0.18, score: contributions.notCeiling },
        { weight: 0.12, score: contributions.balancedAspect },
      ]);
      return { raw: score * baseScore, contributions };
    },
  },
];

// NOTE: 본 리파인 로직은 Cabinet/Shelf 클래스에만 적용
// - 입력이 섞여 들어와도 Cabinet/Shelf 외 클래스는 무시하고 제외
export const refineFurnitureDetections = (
  detections: Detection[] | null | undefined,
  imageMeta?: FurnitureImageMeta | null,
  options?: Partial<FurnitureRefinementOptions>
): {
  refinedDetections: RefinedFurnitureDetection[];
  context: FurnitureRefinementContext | null;
  options: FurnitureRefinementOptions;
} => {
  const mergedOptions = mergeOptions(options);

  if (!detections || detections.length === 0) {
    return {
      refinedDetections: [],
      context: null,
      options: mergedOptions,
    };
  }

  // Cabinet/Shelf 만 선별 (라벨은 0‑based 기준)
  const cabinetOnly = detections.filter((d) => isCabinetShelfIndex(d.label));

  if (cabinetOnly.length === 0) {
    return {
      refinedDetections: [],
      context: null,
      options: mergedOptions,
    };
  }

  const effectiveImage = ensureImageMeta(imageMeta, DEFAULT_IMAGE_META);
  const featureList = cabinetOnly.map((detection) =>
    deriveFeatures(detection, effectiveImage, mergedOptions)
  );
  const context = computeContext(featureList);

  const refinedDetections = cabinetOnly.map((detection, idx) =>
    refineSingle(detection, featureList[idx], context, mergedOptions)
  );

  return { refinedDetections, context, options: mergedOptions };
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const rampUp = (value: number, start: number, end: number) => {
  if (end <= start) return value >= end ? 1 : 0;
  if (value <= start) return 0;
  if (value >= end) return 1;
  return (value - start) / (end - start);
};

const rampDown = (value: number, start: number, end: number) => {
  if (end <= start) return value <= start ? 1 : 0;
  if (value <= start) return 1;
  if (value >= end) return 0;
  return (end - value) / (end - start);
};

const bandPass = (value: number, min: number, max: number) => {
  if (max <= min) return 0;
  if (value <= min || value >= max) return 0;
  const mid = (min + max) / 2;
  const halfSpan = (max - min) / 2;
  return clamp01(1 - Math.abs(value - mid) / halfSpan);
};

const weightedAverage = (entries: Array<{ weight: number; score: number }>) => {
  const numerator = entries.reduce(
    (acc, { weight, score }) => acc + weight * score,
    0
  );
  const denominator = entries.reduce((acc, { weight }) => acc + weight, 0);
  if (denominator === 0) return 0;
  return numerator / denominator;
};

const median = (values: number[]) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length >>> 1);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const deriveFeatures = (
  detection: Detection,
  image: FurnitureImageMeta,
  options: FurnitureRefinementOptions
): InternalFeatures => {
  const [x, y, width, height] = detection.bbox;
  const left = x;
  const top = y;
  const right = x + width;
  const bottom = y + height;

  const widthRatio = width / image.width;
  const heightRatio = height / image.height;
  const leftRatio = left / image.width;
  const rightRatio = right / image.width;
  const topRatio = top / image.height;
  const bottomRatio = bottom / image.height;

  return {
    widthRatio,
    heightRatio,
    areaRatio: (width * height) / (image.width * image.height),
    aspectRatio: widthRatio / Math.max(heightRatio, 1e-6),
    verticalAspect: heightRatio / Math.max(widthRatio, 1e-6),
    centerXRatio: (left + width / 2) / image.width,
    centerYRatio: (top + height / 2) / image.height,
    topRatio,
    bottomRatio,
    leftRatio,
    rightRatio,
    touchesFloor: bottomRatio >= 1 - options.floorContactPadding,
    touchesCeiling: topRatio <= options.ceilingContactPadding,
    touchesLeftWall: leftRatio <= options.edgeContactThreshold,
    touchesRightWall: rightRatio >= 1 - options.edgeContactThreshold,
    left,
    top,
    right,
    bottom,
  };
};

const computeContext = (
  features: InternalFeatures[]
): FurnitureRefinementContext => {
  if (!features.length) {
    return {
      floorLine: 1,
      ceilingLine: 0,
      medianWidthRatio: 0,
      medianHeightRatio: 0,
    };
  }

  const bottomValues = features.map((f) => f.bottomRatio);
  const topValues = features.map((f) => f.topRatio);
  const widthValues = features.map((f) => f.widthRatio);
  const heightValues = features.map((f) => f.heightRatio);

  return {
    floorLine: Math.max(...bottomValues),
    ceilingLine: Math.min(...topValues),
    medianWidthRatio: median(widthValues),
    medianHeightRatio: median(heightValues),
  };
};

const ensureImageMeta = (
  provided: FurnitureImageMeta | null | undefined,
  fallback: FurnitureImageMeta
): FurnitureImageMeta => {
  if (provided && provided.width > 0 && provided.height > 0) {
    return provided;
  }
  return fallback;
};

const DEFAULT_IMAGE_META: FurnitureImageMeta = {
  width: 1536,
  height: 1024,
};

const mergeOptions = (
  options?: Partial<FurnitureRefinementOptions>
): FurnitureRefinementOptions => ({
  ...DEFAULT_OPTIONS,
  ...(options ?? {}),
});

const refineSingle = (
  detection: Detection,
  feature: InternalFeatures,
  context: FurnitureRefinementContext,
  options: FurnitureRefinementOptions
): RefinedFurnitureDetection => {
  const baseScore = Math.pow(
    Math.max(detection.score ?? 0.5, 1e-3),
    options.detectionScoreExponent
  );

  const rawEntries = CATEGORY_DEFINITIONS.map((definition) => {
    const result = definition.compute(feature, context, baseScore, options);
    return {
      key: definition.key,
      raw: Math.max(result.raw, 0),
      contributions: result.contributions,
    };
  });

  const floorWeight = options.minCategoryFloor;
  const ambiguousRaw = Math.max(options.ambiguousPrior * (1 - baseScore), 0);
  const totalRaw =
    rawEntries.reduce((acc, entry) => acc + entry.raw, ambiguousRaw) +
    floorWeight * rawEntries.length;

  const probabilities = {} as Record<FurnitureCategory, number>;
  const contributions: Record<FurnitureCategory, Record<string, number>> = {
    lowerCabinet: {},
    upperCabinet: {},
    wardrobe: {},
    builtInCloset: {},
    chestOfDrawers: {},
    storageCabinet: {},
  };

  rawEntries.forEach((entry) => {
    const numerator =
      entry.raw +
      floorWeight +
      (entry.key === 'storageCabinet' ? ambiguousRaw : 0);
    probabilities[entry.key] = numerator / totalRaw;
    contributions[entry.key] = entry.contributions;
  });

  let bestLabel: FurnitureCategory = rawEntries[0]?.key ?? 'storageCabinet';
  let bestProbability = probabilities[bestLabel] ?? 0;
  (Object.keys(probabilities) as FurnitureCategory[]).forEach((key) => {
    if ((probabilities[key] ?? 0) > bestProbability) {
      bestLabel = key;
      bestProbability = probabilities[key];
    }
  });

  const confidence = clamp01(bestProbability * baseScore);

  const furnitureFeatures: FurnitureFeatures = {
    widthRatio: feature.widthRatio,
    heightRatio: feature.heightRatio,
    areaRatio: feature.areaRatio,
    aspectRatio: feature.aspectRatio,
    verticalAspect: feature.verticalAspect,
    centerXRatio: feature.centerXRatio,
    centerYRatio: feature.centerYRatio,
    topRatio: feature.topRatio,
    bottomRatio: feature.bottomRatio,
    leftRatio: feature.leftRatio,
    rightRatio: feature.rightRatio,
    touchesFloor: feature.touchesFloor,
    touchesCeiling: feature.touchesCeiling,
    touchesLeftWall: feature.touchesLeftWall,
    touchesRightWall: feature.touchesRightWall,
  };

  return {
    ...detection,
    refinedLabel: bestLabel,
    refinedKoLabel: FURNITURE_CATEGORY_LABELS[bestLabel].ko,
    confidence,
    probabilities,
    features: furnitureFeatures,
    contributions,
  };
};
