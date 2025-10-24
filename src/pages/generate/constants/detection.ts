// 감지/리파인 표시 상수
// - 한곳에서 관리하여 화면간 일관성 유지
// - OBJ365_MODEL_PATH: 추론에 사용할 모델 경로 정의
// - DETECTION_MIN_CONFIDENCE: UI 표시 임계값, 낮을수록 더 많이 보이지만 오검출 증가
// - FALLBACK_MAX_CANDIDATES: 임계 미달 시 상위 K개를 보여주는 폴백 개수

export const OBJ365_MODEL_PATH = '/models/dfine_s_obj365.onnx'; // 모델 경로

export const DETECTION_MIN_CONFIDENCE = 0.35; // UI 표시 임계값

export const FALLBACK_MAX_CANDIDATES = 3; // 폴백 후보 최대 개수
