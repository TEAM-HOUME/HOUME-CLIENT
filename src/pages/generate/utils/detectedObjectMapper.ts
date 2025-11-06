// 감지 레이블을 API 파라미터 값으로 매핑하는 유틸
import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';
import type { FurnitureCategoryGroup } from '@pages/generate/types/furniture';

// 기본 매핑 테이블 정의
const BUILTIN_LABEL_MAP: Record<string, string> = {
  // BE 제공 매핑 (object365_word → furniture_name_eng)
  bed: 'DOUBLE',
  desk: 'DESK',
  closet: 'CLOSET',
  dining_table: 'TABLE',
  table: 'TABLE',
  one_seater_sofa: 'ONE_SEATER_SOFA',
  two_seater_sofa: 'TWO_SEATER_SOFA',
  couch: 'TWO_SEATER_SOFA',
  sofa: 'TWO_SEATER_SOFA',
  drawer: 'DRAWER',
  monitor_tv: 'MOVABLE_TV',
  monitor: 'MOVABLE_TV',
  tv: 'MOVABLE_TV',
  sitting_table: 'SITTING_TABLE',
  coffee_table: 'SITTING_TABLE',
  fullbody_mirror: 'FULLBODY_MIRROR',
  mirror: 'FULLBODY_MIRROR',
  book_shelf: 'BOOK_SHELF',
  bookshelf: 'BOOK_SHELF',
  display_cabinet: 'DISPLAY_CABINET',
  cabinet: 'DISPLAY_CABINET',
  // 기존 대응값(테이블에 없는 항목은 기존 코드 유지)
  chair: 'CHAIR',
  stool: 'STOOL',
  bench: 'BENCH',
  lamp: 'LAMP',
  side_table: 'SIDE_TABLE',
  wardrobe: 'WARDROBE',
  storage_cabinet: 'CABINET',
  lowercabinet: 'LOWER_CABINET',
  uppercabinet: 'UPPER_CABINET',
  built_in_closet: 'BUILT_IN_CLOSET',
  chest_of_drawers: 'CHEST_OF_DRAWERS',
  storagebox: 'STORAGE_BOX',
  refrigerator: 'REFRIGERATOR',
  sink: 'SINK',
  faucet: 'FAUCET',
  bathtub: 'BATHTUB',
  pillow: 'PILLOW',
  carpet: 'CARPET',
  rug: 'RUG',
  vase: 'VASE',
  plant: 'PLANT',
  potted_plant: 'PLANT',
  air_conditioner: 'AIR_CONDITIONER',
  speaker: 'SPEAKER',
  washing_machine: 'WASHING_MACHINE',
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
  const map: Record<string, string> = {};
  groups.forEach((group) => {
    const categoryName = group.nameEng?.toLowerCase?.() ?? '';
    if (categoryName) {
      map[normalizeLabel(categoryName)] = group.nameEng.toUpperCase();
    }
    group.furnitures.forEach((item) => {
      const code = item.code?.toUpperCase?.();
      if (!code) return;
      const labelKey = normalizeLabel(item.label ?? '');
      if (labelKey) {
        map[labelKey] = code;
      }
    });
  });
  return map;
};

// 감지된 핫스팟을 API 파라미터 배열로 변환
export const mapHotspotsToDetectedObjects = (
  hotspots: FurnitureHotspot[],
  dynamicMap: Record<string, string>
) => {
  const mergedMap = {
    ...BUILTIN_LABEL_MAP,
    ...dynamicMap,
  };
  const codes = hotspots
    .map((hotspot) => hotspot.finalLabel ?? hotspot.className ?? '')
    .filter((label): label is string => label.trim().length > 0)
    .map((label) => {
      const normalized = normalizeLabel(label);
      const mapped = mergedMap[normalized];
      if (mapped) return mapped;
      return normalized.toUpperCase();
    });
  return Array.from(new Set(codes));
};
