// 감지 레이블을 API 파라미터 값으로 매핑하는 유틸
import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';
import type { FurnitureCategoryGroup } from '@pages/generate/types/furniture';

// 기본 매핑 테이블 정의 (OBJ365 라벨 → 백엔드 object365_word)
const BUILTIN_LABEL_MAP: Record<string, readonly string[]> = {
  bed: ['Bed', 'DOUBLE'],
  single_bed: ['Bed', 'SINGLE'],
  super_single_bed: ['Bed', 'SUPER_SINGLE'],
  queen_bed: ['Bed', 'QUEEN_OVER'],
  desk: ['Desk', 'DESK'],
  closet: ['closet', 'CLOSET'],
  wardrobe: ['closet', 'CLOSET'],
  dining_table: ['Dining Table', 'TABLE'],
  table: ['Dining Table', 'TABLE'],
  coffee_table: ['sitting table', 'SITTING_TABLE'],
  side_table: ['sitting table', 'SITTING_TABLE'],
  sitting_table: ['sitting table', 'SITTING_TABLE'],
  one_seater_sofa: ['one seater sofa', 'ONE_SEATER_SOFA'],
  two_seater_sofa: ['two seater sofa', 'TWO_SEATER_SOFA'],
  sofa: ['two seater sofa', 'TWO_SEATER_SOFA'],
  couch: ['two seater sofa', 'TWO_SEATER_SOFA'],
  drawer: ['drawer', 'DRAWER'],
  dresser: ['drawer', 'DRAWER'],
  cabinet: ['display cabinet', 'DISPLAY_CABINET'],
  display_cabinet: ['display cabinet', 'DISPLAY_CABINET'],
  storage_cabinet: ['display cabinet', 'DISPLAY_CABINET'],
  lowercabinet: ['display cabinet', 'DISPLAY_CABINET'],
  uppercabinet: ['display cabinet', 'DISPLAY_CABINET'],
  monitor_tv: ['Monitor/TV', 'MOVABLE_TV'],
  monitor: ['Monitor/TV', 'MOVABLE_TV'],
  tv: ['Monitor/TV', 'MOVABLE_TV'],
  television: ['Monitor/TV', 'MOVABLE_TV'],
  fullbody_mirror: ['fullbody mirror', 'FULLBODY_MIRROR'],
  mirror: ['fullbody mirror', 'FULLBODY_MIRROR'],
  book_shelf: ['book shelf', 'BOOK_SHELF'],
  bookshelf: ['book shelf', 'BOOK_SHELF'],
  chair: ['Chair'],
  stool: ['Stool'],
  bench: ['Bench'],
  lamp: ['Lamp'],
  built_in_closet: ['closet', 'CLOSET'],
  chest_of_drawers: ['drawer', 'DRAWER'],
  storagebox: ['drawer', 'DRAWER'],
  refrigerator: ['Refrigerator'],
  sink: ['Sink'],
  faucet: ['Faucet'],
  bathtub: ['Bathtub'],
  pillow: ['Pillow'],
  carpet: ['Carpet'],
  rug: ['Carpet'],
  vase: ['Vase'],
  plant: ['Plant'],
  potted_plant: ['Plant'],
  air_conditioner: ['Air Conditioner'],
  speaker: ['Speaker'],
  washing_machine: ['Washing Machine'],
};

// 문자열 정규화 유틸 정의
const normalizeLabel = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');

// 대시보드 응답을 매핑 테이블로 변환
export const buildDashboardLabelMap = (
  groups: FurnitureCategoryGroup[] | undefined
) => {
  if (!groups) return {};
  const map: Record<string, readonly string[]> = {};
  groups.forEach((group) => {
    const categoryName = group.nameEng?.toLowerCase?.() ?? '';
    if (categoryName) {
      map[normalizeLabel(categoryName)] = [group.nameEng.toUpperCase()];
    }
    group.furnitures.forEach((item) => {
      const code = item.code?.toUpperCase?.();
      if (!code) return;
      const labelKey = normalizeLabel(item.label ?? '');
      if (labelKey) {
        const list = map[labelKey] ?? [];
        map[labelKey] = [...list, code];
      }
    });
  });
  return map;
};

// 감지된 핫스팟을 API 파라미터 배열로 변환
export const mapHotspotsToDetectedObjects = (
  hotspots: FurnitureHotspot[],
  dynamicMap: Record<string, readonly string[]>
) => {
  const mergedMap: Record<string, readonly string[]> = {
    ...BUILTIN_LABEL_MAP,
    ...dynamicMap,
  };
  const result = new Set<string>();
  hotspots
    .map((hotspot) => hotspot.finalLabel ?? hotspot.className ?? '')
    .filter((label): label is string => label.trim().length > 0)
    .forEach((label) => {
      const normalized = normalizeLabel(label);
      const mapped = mergedMap[normalized];
      if (mapped && mapped.length > 0) {
        mapped.forEach((value) => result.add(value));
      } else {
        const fallback = normalized
          .split('_')
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        if (fallback) result.add(fallback);
      }
    });
  return Array.from(result);
};
