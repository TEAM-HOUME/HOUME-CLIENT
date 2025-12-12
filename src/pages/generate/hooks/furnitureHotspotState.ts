import type { Dispatch } from 'react';

import type { Detection as FurnitureDetection } from '@pages/generate/types/detection';
import type { CabinetRefinementCategory } from '@pages/generate/utils/refineFurnitureDetections';

// 가구 핫스팟 상태 타입과 reducer 정의
export type FurnitureHotspot = FurnitureDetection & {
  id: number;
  cx: number;
  cy: number;
  refinedLabel?: CabinetRefinementCategory;
  refinedLabelEn?: string;
  finalLabel: string | null;
  confidence?: number;
};

export type DebugRect = {
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;
  label: string | null;
};

export type HotspotImageMeta = {
  width: number;
  height: number;
};

export type HotspotContainerSize = {
  width: number;
  height: number;
};

export type RenderMetrics = {
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
};

export type FurnitureHotspotStatus =
  | 'idle'
  | 'loading'
  | 'processing'
  | 'ready'
  | 'error';

export type FurnitureHotspotState = {
  status: FurnitureHotspotStatus;
  hotspots: FurnitureHotspot[];
  projectedHotspots: FurnitureHotspot[];
  debugRects: DebugRect[];
  imageMeta: HotspotImageMeta | null;
  renderMetrics: RenderMetrics | null;
  containerSize: HotspotContainerSize;
  error: Error | null;
};

export type FurnitureHotspotAction =
  | { type: 'PIPELINE_RESET' }
  | { type: 'INFERENCE_STARTED' }
  | {
      type: 'HOTSPOTS_READY';
      payload: { hotspots: FurnitureHotspot[]; imageMeta: HotspotImageMeta };
    }
  | {
      type: 'PROJECTED_READY';
      payload: {
        projectedHotspots: FurnitureHotspot[];
        debugRects: DebugRect[];
      };
    }
  | { type: 'SET_RENDER_METRICS'; payload: RenderMetrics | null }
  | { type: 'SET_CONTAINER_SIZE'; payload: HotspotContainerSize }
  | { type: 'PIPELINE_ERROR'; payload: { error: Error | null } };

const areHotspotsEqual = (
  prev: FurnitureHotspot[],
  next: FurnitureHotspot[]
) => {
  if (prev.length !== next.length) return false;
  for (let i = 0; i < next.length; i += 1) {
    const prevHotspot = prev[i];
    const nextHotspot = next[i];
    if (
      prevHotspot.id !== nextHotspot.id ||
      prevHotspot.score !== nextHotspot.score ||
      prevHotspot.confidence !== nextHotspot.confidence ||
      prevHotspot.refinedLabel !== nextHotspot.refinedLabel ||
      prevHotspot.refinedLabelEn !== nextHotspot.refinedLabelEn ||
      prevHotspot.finalLabel !== nextHotspot.finalLabel ||
      prevHotspot.cx !== nextHotspot.cx ||
      prevHotspot.cy !== nextHotspot.cy
    ) {
      return false;
    }
  }
  return true;
};

const areDebugRectsEqual = (prev: DebugRect[], next: DebugRect[]) => {
  if (prev.length !== next.length) return false;
  for (let i = 0; i < next.length; i += 1) {
    const prevRect = prev[i];
    const nextRect = next[i];
    if (
      prevRect.id !== nextRect.id ||
      prevRect.left !== nextRect.left ||
      prevRect.top !== nextRect.top ||
      prevRect.width !== nextRect.width ||
      prevRect.height !== nextRect.height ||
      prevRect.label !== nextRect.label
    ) {
      return false;
    }
  }
  return true;
};

const createInitialState = (): FurnitureHotspotState => ({
  status: 'idle',
  hotspots: [],
  projectedHotspots: [],
  debugRects: [],
  imageMeta: null,
  renderMetrics: null,
  containerSize: { width: 0, height: 0 },
  error: null,
});

export const furnitureHotspotInitialState = createInitialState();

export const furnitureHotspotReducer = (
  state: FurnitureHotspotState,
  action: FurnitureHotspotAction
): FurnitureHotspotState => {
  switch (action.type) {
    case 'PIPELINE_RESET':
      return { ...createInitialState(), containerSize: state.containerSize };
    case 'INFERENCE_STARTED':
      return { ...state, status: 'loading', error: null };
    case 'HOTSPOTS_READY': {
      const { hotspots, imageMeta } = action.payload;
      if (areHotspotsEqual(state.hotspots, hotspots) && state.imageMeta) {
        return { ...state, status: 'processing', imageMeta };
      }
      return {
        ...state,
        hotspots,
        imageMeta,
        status: 'processing',
      };
    }
    case 'PROJECTED_READY': {
      const { projectedHotspots, debugRects } = action.payload;
      const nextState: FurnitureHotspotState = {
        ...state,
        projectedHotspots,
        debugRects,
        status: 'ready',
      };
      if (
        areHotspotsEqual(state.projectedHotspots, projectedHotspots) &&
        areDebugRectsEqual(state.debugRects, debugRects)
      ) {
        return state.status === 'ready' ? state : { ...state, status: 'ready' };
      }
      return nextState;
    }
    case 'SET_RENDER_METRICS':
      if (state.renderMetrics === action.payload) return state;
      return { ...state, renderMetrics: action.payload };
    case 'SET_CONTAINER_SIZE': {
      const { width, height } = action.payload;
      if (
        state.containerSize.width === width &&
        state.containerSize.height === height
      ) {
        return state;
      }
      return { ...state, containerSize: action.payload };
    }
    case 'PIPELINE_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload.error,
        hotspots: [],
        projectedHotspots: [],
        debugRects: [],
      };
    default:
      return state;
  }
};

export const createLoggedPipelineDispatch = (
  dispatch: Dispatch<FurnitureHotspotAction>,
  log: (event: string, payload?: Record<string, unknown>) => void
) => {
  return (action: FurnitureHotspotAction) => {
    log('hotspot-action', { type: action.type });
    dispatch(action);
  };
};
