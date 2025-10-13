import { describe, it, expect, expectTypeOf } from 'vitest';

import { API_ENDPOINT, type ApiEndpoint } from './apiEndpoints';

// 런타임에서 중첩 객체의 모든 leaf 값 추출하는 헬퍼 함수
function extractDeepValues(obj: any): string[] {
  const values: string[] = [];

  function traverse(current: any) {
    if (typeof current === 'string') {
      values.push(current);
    } else if (typeof current === 'function') {
      // 함수형 엔드포인트는 예시 값으로 테스트
      const exampleValue = current('example-id');
      if (typeof exampleValue === 'string') {
        values.push(exampleValue);
      }
    } else if (typeof current === 'object' && current !== null) {
      Object.values(current).forEach(traverse);
    }
  }

  traverse(obj);
  return values;
}

describe('API_ENDPOINT 상수 테스트', () => {
  describe('타입 레벨 테스트', () => {
    it('ApiEndpoint 타입이 string 리터럴 유니온 타입이어야 함', () => {
      // ApiEndpoint가 string의 서브타입인지 확인
      expectTypeOf<ApiEndpoint>().toBeString();

      // 특정 엔드포인트들이 타입에 포함되는지 확인
      expectTypeOf<ApiEndpoint>().extract<'/logout'>().toBeString();
      expectTypeOf<ApiEndpoint>().extract<'/api/v1/sign-up'>().toBeString();
      expectTypeOf<ApiEndpoint>().extract<'/api/v1/carousels'>().toBeString();
    });

    it('잘못된 엔드포인트는 ApiEndpoint 타입에 할당할 수 없어야 함', () => {
      // @ts-expect-error - 존재하지 않는 엔드포인트는 타입 에러
      const wrongEndpoint: ApiEndpoint = '/wrong/endpoint';

      // TypeScript 컴파일러가 이 라인에서 에러를 발생시켜야 함
      expect(wrongEndpoint).toBeDefined(); // 실제로는 도달하지 않음
    });

    it('API_ENDPOINT 객체 구조가 readonly여야 함', () => {
      expectTypeOf(API_ENDPOINT).toEqualTypeOf<Readonly<typeof API_ENDPOINT>>();
      expectTypeOf(API_ENDPOINT.AUTH).toEqualTypeOf<
        Readonly<typeof API_ENDPOINT.AUTH>
      >();
    });
  });

  describe('런타임 검증 테스트', () => {
    it('모든 엔드포인트가 문자열이어야 함', () => {
      const allEndpoints = extractDeepValues(API_ENDPOINT);

      allEndpoints.forEach((endpoint) => {
        expect(typeof endpoint).toBe('string');
      });
    });

    it('모든 엔드포인트가 올바른 형식이어야 함', () => {
      const allEndpoints = extractDeepValues(API_ENDPOINT);

      allEndpoints.forEach((endpoint) => {
        // 엔드포인트는 '/'로 시작해야 함
        expect(endpoint).toMatch(/^\//);

        // 엔드포인트에 공백이 없어야 함
        expect(endpoint).not.toMatch(/\s/);

        // 엔드포인트가 비어있지 않아야 함
        expect(endpoint.length).toBeGreaterThan(1);
      });
    });

    it('중복된 엔드포인트가 없어야 함', () => {
      const allEndpoints = extractDeepValues(API_ENDPOINT);
      const uniqueEndpoints = new Set(allEndpoints);

      // 중복 찾기
      const duplicates = allEndpoints.filter(
        (item, index) => allEndpoints.indexOf(item) !== index
      );

      if (duplicates.length > 0) {
        console.log('중복된 엔드포인트:', duplicates);
      }

      expect(duplicates).toHaveLength(0);
      expect(allEndpoints.length).toBe(uniqueEndpoints.size);
    });

    it('각 도메인 그룹이 하나 이상의 엔드포인트를 가져야 함', () => {
      Object.entries(API_ENDPOINT).forEach(([domain, endpoints]) => {
        const domainEndpoints = extractDeepValues(endpoints);
        expect(domainEndpoints.length).toBeGreaterThan(0);

        // 각 도메인 이름 로깅 (디버깅용)
        console.log(`${domain}: ${domainEndpoints.length}개 엔드포인트`);
      });
    });
  });

  describe('엔드포인트 추출 정확성 테스트', () => {
    it('DeepValues 타입이 모든 엔드포인트를 추출해야 함', () => {
      const runtimeEndpoints = extractDeepValues(API_ENDPOINT);

      // 알려진 엔드포인트들이 모두 추출되었는지 확인
      const knownEndpoints = [
        '/oauth/kakao/callback',
        '/logout',
        '/reissue',
        '/api/v1/sign-up',
        '/api/v1/mypage/user',
        '/api/v1/housing-selections',
        '/api/v1/carousels',
        '/api/v1/furnitures/logs',
        '/api/v1/check-has-generated-image',
      ];

      knownEndpoints.forEach((endpoint) => {
        expect(runtimeEndpoints).toContain(endpoint);
      });
    });

    it('정확한 엔드포인트 개수를 추출해야 함', () => {
      const runtimeEndpoints = extractDeepValues(API_ENDPOINT);

      // 현재 정의된 엔드포인트 총 개수
      const expectedCount =
        3 + // AUTH (KAKAO_CALLBACK, LOGOUT, REISSUE)
        5 + // USER (SIGN_UP, MYPAGE, MYPAGE_IMAGES, MYPAGE_IMAGE_DETAIL, DELETE)
        4 + // ONBOARDING
        6 + // GENERATE
        3; // ANALYTICS

      expect(runtimeEndpoints.length).toBe(expectedCount);
    });
  });

  describe('확장성 테스트', () => {
    it('새로운 도메인 그룹 추가 시 타입이 자동 업데이트되어야 함', () => {
      // 새 그룹을 추가한 mock 객체
      const extendedEndpoints = {
        ...API_ENDPOINT,
        NEW_DOMAIN: {
          TEST_ENDPOINT: '/api/v1/new/test',
          ANOTHER_ENDPOINT: '/api/v1/new/another',
        },
      } as const;

      // 새 엔드포인트들이 추출되는지 확인
      const allEndpoints = extractDeepValues(extendedEndpoints);
      expect(allEndpoints).toContain('/api/v1/new/test');
      expect(allEndpoints).toContain('/api/v1/new/another');

      // 타입 레벨에서도 자동으로 추론되는지 확인
      type ExtendedEndpoints = typeof extendedEndpoints;
      type ExtendedValues = ExtendedEndpoints[keyof ExtendedEndpoints];

      expectTypeOf<ExtendedValues>().toBeObject();
    });

    it('기존 도메인에 새 엔드포인트 추가 시 자동 감지되어야 함', () => {
      // AUTH 도메인에 새 엔드포인트 추가
      const extendedAuth = {
        ...API_ENDPOINT.AUTH,
        NEW_AUTH: '/api/v1/auth/new',
      } as const;

      const authEndpoints = extractDeepValues(extendedAuth);

      // 기존 엔드포인트 + 새 엔드포인트
      expect(authEndpoints.length).toBe(4); // 기존 3개 + 새로운 1개
      expect(authEndpoints).toContain('/api/v1/auth/new');
    });
  });

  describe('API 버전 관리 테스트', () => {
    it('v1과 v2 엔드포인트가 공존해야 함', () => {
      const allEndpoints = extractDeepValues(API_ENDPOINT);

      const v1Endpoints = allEndpoints.filter((e) => e.includes('/api/v1/'));
      const v2Endpoints = allEndpoints.filter((e) => e.includes('/api/v2/'));

      expect(v1Endpoints.length).toBeGreaterThan(0);
      expect(v2Endpoints.length).toBeGreaterThan(0);

      // v2 엔드포인트 확인
      expect(allEndpoints).toContain('/api/v2/generated-images/generate');
    });
  });
});

// 타입 유틸리티 테스트
describe('DeepValues 헬퍼 타입 테스트', () => {
  it('단일 레벨 객체에서 값 추출', () => {
    const simple = { a: 'A', b: 'B' } as const;
    type SimpleValues = (typeof simple)[keyof typeof simple];

    expectTypeOf<SimpleValues>().toEqualTypeOf<'A' | 'B'>();
  });

  it('중첩 객체에서 모든 리프 값 추출', () => {
    const nested = {
      group1: { a: 'A', b: 'B' },
      group2: { c: 'C', d: 'D' },
    } as const;

    const values = extractDeepValues(nested);
    expect(values).toEqual(['A', 'B', 'C', 'D']);
  });

  it('깊게 중첩된 객체도 처리 가능', () => {
    const deepNested = {
      level1: {
        level2: {
          level3: {
            endpoint: '/deep/nested/endpoint',
          },
        },
      },
    } as const;

    const values = extractDeepValues(deepNested);
    expect(values).toEqual(['/deep/nested/endpoint']);
  });
});
