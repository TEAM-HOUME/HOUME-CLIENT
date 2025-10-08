export interface Detection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  score: number;
  label: number;
  className?: string;
}

export interface ModelOutput {
  labels: Float32Array;
  boxes: Float32Array;
  scores: Float32Array;
}

export interface ProcessedDetections {
  detections: Detection[];
  inferenceTime: number;
}
