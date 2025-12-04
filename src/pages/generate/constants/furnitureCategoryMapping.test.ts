import { describe, expect, it } from 'vitest';

import {
  filterAllowedFurnitureCodes,
  hasFurnitureCodeForIndex,
  resolveFurnitureCodes,
} from './furnitureCategoryMapping';

describe('furnitureCategoryMapping', () => {
  it('finalLabel 기반으로 침대 코드를 반환해요', () => {
    const codes = resolveFurnitureCodes({ finalLabel: 'Bed' });
    expect(codes).toEqual(['SINGLE']);
  });

  it('refinedLabel 기반 옷장 코드를 반환해요', () => {
    const codes = resolveFurnitureCodes({
      refinedLabel: 'wardrobe',
    });
    expect(codes).toEqual(['CLOSET']);
  });

  it('OBJ365 index 37을 MOVABLE_TV로 매핑해요', () => {
    expect(hasFurnitureCodeForIndex(37)).toBe(true);
    const codes = resolveFurnitureCodes({ obj365Label: 37 });
    expect(codes).toEqual(['MOVABLE_TV']);
  });

  it('finalLabel 의자를 SINGLE_SOFA로 매핑해요', () => {
    const codes = resolveFurnitureCodes({ finalLabel: 'Chair' });
    expect(codes).toEqual(['SINGLE_SOFA']);
  });

  it('OBJ365 index 12는 리파인 없으면 감지 실패로 처리해요', () => {
    const codes = resolveFurnitureCodes({ obj365Label: 12 });
    expect(codes).toEqual([]);
  });

  it('Storage box를 DRAWER로 매핑해요', () => {
    const codes = resolveFurnitureCodes({ finalLabel: 'Storage box' });
    expect(codes).toEqual(['DRAWER']);
  });

  it('허용 코드 필터가 중복과 잘못된 값을 제거해요', () => {
    const filtered = filterAllowedFurnitureCodes([
      'SINGLE',
      'SINGLE',
      'INVALID' as never,
    ]);
    expect(filtered).toEqual(['SINGLE']);
  });
});
