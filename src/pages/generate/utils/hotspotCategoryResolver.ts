import {
  resolveFurnitureCode,
  type FurnitureCategoryCode,
} from '@pages/generate/constants/furnitureCategoryMapping';

import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';
import type { FurnitureCategoryResponse } from '@pages/generate/types/furniture';

// 서버 카테고리명 → 내부 코드 역매핑 키워드 목록(한글 변경 시 이곳 업데이트)
export const CATEGORY_NAME_KEYWORDS: Record<FurnitureCategoryCode, string[]> = {
  SINGLE: ['싱글', '슈퍼싱글', '더블', '퀸 이상'],
  OFFICE_DESK: ['업무용 책상'],
  CLOSET: ['옷장'],
  DINING_TABLE: ['식탁'],
  SINGLE_SOFA: ['1인용 소파'],
  DRAWER: ['수납장'],
  MOVABLE_TV: ['이동식 TV'],
  SITTING_TABLE: ['좌식 테이블'],
  MIRROR: ['전신 거울'],
  WHITE_BOOKSHELF: ['책 선반'],
  DISPLAY_CABINET: ['장식장'],
  TWO_SEATER_SOFA: ['2인용 소파'],
};

const normalizeCategoryName = (value?: string | null) =>
  value?.toString().trim().replace(/\s+/g, '').toUpperCase() ?? '';

// 카테고리 이름으로 코드 매칭 유틸
export const matchCodeByCategoryName = (
  name?: string | null
): FurnitureCategoryCode | null => {
  const normalized = normalizeCategoryName(name);
  if (!normalized) return null;
  for (const [code, keywords] of Object.entries(CATEGORY_NAME_KEYWORDS)) {
    if (
      keywords.some((keyword) =>
        normalized.includes(normalizeCategoryName(keyword))
      )
    ) {
      return code as FurnitureCategoryCode;
    }
  }
  return null;
};

// 감지 코드 배열과 서버 카테고리 목록을 매핑(Map)으로 생성
export const buildDetectedCodeToCategoryId = (
  allowedCategories?: FurnitureCategoryResponse[],
  detectedObjects?: FurnitureCategoryCode[]
) => {
  const map = new Map<FurnitureCategoryCode, number>();
  if (!allowedCategories?.length || !detectedObjects?.length) return map;

  allowedCategories.forEach((category) => {
    const matchedCode = matchCodeByCategoryName(category.categoryName);
    if (matchedCode && !map.has(matchedCode)) {
      map.set(matchedCode, category.id);
    }
  });

  return map;
};

// 핫스팟 하나에 대해 서버 카테고리 ID를 찾는 유틸
export const resolveCategoryIdForHotspot = (
  hotspot: FurnitureHotspot,
  resolvedCode: FurnitureCategoryCode | null,
  allowedCategories: FurnitureCategoryResponse[] | undefined,
  codeMap: Map<FurnitureCategoryCode, number>
): number | null => {
  const allowedIdSet = new Set(allowedCategories?.map((c) => c.id));

  if (resolvedCode) {
    const byCode = codeMap.get(resolvedCode);
    if (byCode && allowedIdSet.has(byCode)) {
      return byCode;
    }
  }

  // 후순위: 서버 카테고리 이름과 핫스팟 라벨 문자열 비교
  const nameToAllowedId = new Map<string, number>();
  (allowedCategories ?? []).forEach((c) => {
    const n = (c.categoryName ?? '').toString().trim();
    if (!n) return;
    nameToAllowedId.set(n.toUpperCase(), c.id);
    nameToAllowedId.set(n.replaceAll(' ', '_').toUpperCase(), c.id);
  });
  const fallbackLabels = [hotspot.finalLabel ?? '', hotspot.className ?? '']
    .flatMap((label) =>
      label
        .split('/')
        .map((part: string) => part.trim())
        .filter(Boolean)
    )
    .map((label) => label.toUpperCase());
  for (const label of fallbackLabels) {
    const direct = nameToAllowedId.get(label);
    if (direct) return direct;
  }

  return null;
};

// 카테고리 ID에 매칭되는 핫스팟 ID를 찾는 헬퍼(없으면 null)
export const pickHotspotIdByCategory = (
  categoryId: number,
  hotspots: FurnitureHotspot[],
  allowedCategories: FurnitureCategoryResponse[] | undefined,
  codeMap: Map<FurnitureCategoryCode, number>
): number | null => {
  for (const hotspot of hotspots) {
    const resolvedCode = resolveFurnitureCode({
      finalLabel: hotspot.finalLabel,
      obj365Label: hotspot.label ?? null,
      refinedLabel: hotspot.refinedLabel,
      refinedConfidence: hotspot.confidence,
    });
    const matchedCategoryId = resolveCategoryIdForHotspot(
      hotspot,
      resolvedCode,
      allowedCategories,
      codeMap
    );
    if (matchedCategoryId === categoryId) {
      return hotspot.id;
    }
  }
  return null;
};
