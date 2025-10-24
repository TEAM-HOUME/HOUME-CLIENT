// [보관용 파일]
// - 전체 Objects365 클래스와 가구 서브셋을 함께 다루던 구버전 유틸
// - 런타임 사용은 obj365Furniture.ts로 대체
// - 유지 목적: 레퍼런스/디버깅, 과거 인덱스 확인
import { OBJ365_ALL_CLASSES } from './obj365AllClasses';

// Objects365 중 가구 관련 클래스 인덱스만 선별
export const OBJ365_FURNITURE_CLASS_IDS = [
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
  79, // Mirror
  83, // Air Conditioner
  94, // Clock
  98, // Dining Table
  110, // Fan
  121, // Nightstand
  167, // Coffee Table
  168, // Side Table
  175, // Radiator
  191, // Bathtub
];

// 가구 id → 이름 매핑(레퍼런스용)
export const OBJ365_FURNITURE_CLASSES = OBJ365_FURNITURE_CLASS_IDS.map(
  (id) => ({
    id,
    name: OBJ365_ALL_CLASSES[id] ?? 'Unknown',
  })
);

export const OBJ365_FURNITURE_CLASS_ID_SET = new Set(
  OBJ365_FURNITURE_CLASS_IDS
);

// 런타임 대체: obj365Furniture.isFurnitureIndex 사용 권장
export const isFurnitureClassId = (classId: number | undefined | null) =>
  typeof classId === 'number' && OBJ365_FURNITURE_CLASS_ID_SET.has(classId);

// Cabinet/Shelf 전용 식별자/체커
// - refine 단계는 Cabinet/Shelf에만 적용
export const OBJ365_CABINET_SHELF_CLASS_ID = 12; // zero-based index in OBJ365_ALL_CLASSES
export const OBJ365_CABINET_SHELF_CLASS_NAME = 'Cabinet/shelf';

export const isCabinetShelfClassId = (classId: number | undefined | null) =>
  typeof classId === 'number' && classId === OBJ365_CABINET_SHELF_CLASS_ID;

export const isCabinetShelfClassName = (name: string | undefined | null) =>
  (name ?? '') === OBJ365_CABINET_SHELF_CLASS_NAME;
