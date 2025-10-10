// ML detection shared types
// Re-export Detection to keep a single source of truth from refine utility
export type { Detection } from '../utils/refineFurnitureDetections';

export interface ProcessedDetections {
  detections: Detection[];
  inferenceTime: number;
}
