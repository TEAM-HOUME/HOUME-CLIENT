import { OBJ365_ALL_CLASSES } from './obj365AllClasses';

// Objects365 중 가구 관련 클래스 인덱스만 선별
export const OBJ365_FURNITURE_CLASS_IDS = [
  2, // Chair
  9, // Desk
  12, // Cabinet/shelf
  20, // Storage box
  24, // Bench
  47, // Stool
  50, // Couch
  75, // Bed
  98, // Dining Table
  167, // Coffee Table
  168, // Side Table
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
