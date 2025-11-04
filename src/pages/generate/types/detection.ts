// ML detection shared types
// 단일 소스(유틸)에서 타입을 가져와 재사용하고, 이 파일 내에서도 참조 가능하게 지역 스코프로 도입
import type { Detection } from '../utils/refineFurnitureDetections';
export type { Detection } from '../utils/refineFurnitureDetections';

/**
 * onnxruntime 한 번 실행 후 반환되는 데이터 묶음
 * - `detections`: 640×640 입력 기준으로 나온 감지 박스 목록(추후 단계에서 원본 좌표로 보정)
 * - `inferenceTime`: 추론에 걸린 시간(ms)
 */
export interface ProcessedDetections {
  detections: Detection[];
  inferenceTime: number;
}
