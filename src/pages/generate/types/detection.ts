// ML detection shared types
// Detection 인터페이스를 단일 소스로 유지해 타입 불일치 방지
/**
 * ML 객체 감지 결과 타입 설명
 * @property bbox - 바운딩 박스(bounding box) 좌표 [x, y, width, height] 형식
 * @property score - 감지 신뢰도(score) 0~1 범위
 * @property label - 클래스 인덱스(class index) 0-based 선택 사항
 * @property className - 클래스 이름(class name) 선택 사항 현재 미사용
 */
export interface Detection {
  bbox: [number, number, number, number];
  score: number;
  label?: number;
  className?: string;
}

/**
 * onnxruntime 한 번 실행 후 반환되는 데이터 묶음
 * - `detections`: 640×640 입력 기준으로 나온 감지 박스 목록(추후 단계에서 원본 좌표로 보정)
 * - `inferenceTime`: 추론에 걸린 시간(ms)
 */
export interface ProcessedDetections {
  detections: Detection[];
  inferenceTime: number;
}
