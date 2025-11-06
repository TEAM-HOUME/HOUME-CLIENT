// OBJ365 가구(furniture) 전용 상수/유틸
// - 내부 표준 라벨은 0‑based index를 사용
// - 모델 출력(1‑based)을 입력받을 경우 normalizeObj365Label로 변환 후 사용

// 가구 관련 0‑based 인덱스는 튜플로 고정
export const OBJ365_FURNITURE_INDEXES = [
  2, // Chair
  6, // Lamp
  9, // Desk
  12, // Cabinet/shelf
  16, // Picture/Frame
  20, // Storage box
  24, // Bench
  25, // Potted Plant
  28, // Pillow
  30, // Vase
  37, // Monitor/TV
  41, // Speaker
  47, // Stool
  50, // Couch
  60, // Carpet
  71, // Candle
  75, // Bed
  76, // Faucet(수도꼭지)
  79, // Mirror
  81, // Sink(싱크대)
  83, // Air Conditioner
  94, // Clock
  98, // Dining Table
  110, // Fan
  121, // Nightstand
  133, // Refrigerator(냉장고)
  134, // Oven(오븐)
  149, // Gas stove(가스레인지)
  153, // Toilet(변기)
  163, // Microwave(전자레인지)
  167, // Coffee Table
  168, // Side Table
  175, // Radiator
  191, // Bathtub
  201, // Extractor(레인지후드)
  213, // Coffee Machine(커피머신)
  220, // Washing Machine/Drying Machine(세탁기)
  235, // Blender(블렌더)
  268, // Induction Cooker(인덕션)
  277, // Toaster(토스터)
  301, // Showerhead(샤워헤드)
  310, // Dishwasher(식기세척기)
  314, // Rice Cooker(밥솥)
  325, // Urinal(소변기)
] as const;

// 선정 기준: 실내 가구 및 필수 소품으로 모델 학습 시 검증된 목록 유지
// Candle 등 소품은 광원/장식 역할로 후처리 로직에서 필요
export const OBJ365_FURNITURE_INDEX_SET = new Set<number>(
  OBJ365_FURNITURE_INDEXES
);

// Cabinet/Shelf 고정 인덱스(0‑based)
export const OBJ365_CABINET_SHELF_INDEX = 12;

// 1‑based → 0‑based 정규화
export const normalizeObj365Label = (label1Based: number): number =>
  label1Based - 1;

// 0‑based 가구 여부
export const isFurnitureIndex = (idx0: number | undefined | null): boolean =>
  typeof idx0 === 'number' && OBJ365_FURNITURE_INDEX_SET.has(idx0);

// 0‑based Cabinet/Shelf 여부
export const isCabinetShelfIndex = (idx0: number | undefined | null): boolean =>
  typeof idx0 === 'number' && idx0 === OBJ365_CABINET_SHELF_INDEX;

// 1‑based 입력을 받아 가구 여부를 판정하는 헬퍼(필요 시)
export const isFurnitureLabel = (label1: number | undefined | null): boolean =>
  typeof label1 === 'number' && isFurnitureIndex(normalizeObj365Label(label1));

// 1‑based 입력을 받아 Cabinet/Shelf 여부를 판정하는 헬퍼(필요 시)
export const isCabinetShelfLabel = (
  label1: number | undefined | null
): boolean =>
  typeof label1 === 'number' &&
  isCabinetShelfIndex(normalizeObj365Label(label1));
