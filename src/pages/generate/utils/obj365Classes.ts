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

export const OBJ365_FURNITURE_CLASSES = OBJ365_FURNITURE_CLASS_IDS.map(
  (id) => ({
    id,
    name: OBJ365_ALL_CLASSES[id] ?? 'Unknown',
  })
);

export const OBJ365_FURNITURE_CLASS_ID_SET = new Set(
  OBJ365_FURNITURE_CLASS_IDS
);

export const isFurnitureClassId = (classId: number | undefined | null) =>
  typeof classId === 'number' && OBJ365_FURNITURE_CLASS_ID_SET.has(classId);
