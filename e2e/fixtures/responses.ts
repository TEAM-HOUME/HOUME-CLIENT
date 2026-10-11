export const APP_ORIGIN = 'http://127.0.0.1:4173';
export const GENERATE_PATH = '/api/v4/generated-images/generate';

export interface MockReply {
  status: number;
  data: unknown;
}
export const success = (data: unknown): MockReply => ({ status: 200, data });
export const imagePath = (name: string) => '/__e2e/images/' + name + '.svg';

export function createResponses(variant: 'A' | 'B' = 'A') {
  const floor = variant === 'A' ? 701 : 702;
  const image = variant === 'A' ? 9001 : 9002;
  const views = variant === 'A' ? ['view-a', 'view-b'] : ['view-z'];
  const moods = variant === 'A' ? [87, 305, 21] : [98];
  const templates = {
    isExact: true,
    floorPlans: [
      {
        id: floor,
        name: '테스트 도면 ' + floor,
        imageUrl: imagePath('plan' + floor),
        isLatest: true,
      },
    ],
  };
  const replies: Record<string, MockReply> = {
    'GET /api/v2/house-templates': success(templates),
    'GET /api/v2/house-templates?size=4': success(templates),
    ['GET /api/v2/house-templates/' + floor]: success({
      floorPlanId: floor,
      floorPlanName: '테스트 도면 ' + floor,
      equilibrium: '10평',
      floorPlans: views.map((view) => ({ imageUrl: imagePath(view), view })),
    }),
    'GET /api/v2/recent-floor-plan': success({
      hasRecentImage: false,
      floorPlans: [],
    }),
    'GET /api/v1/moodboard-images?limit=18': success({
      moodBoardResponseList: moods.map((id) => ({
        id,
        imageUrl: imagePath('mood-' + id),
        fileExtension: 'svg',
      })),
    }),
    'GET /api/v2/dashboard/activities': success({
      activities: [
        {
          code: 'HOME_CAFE',
          label: '홈카페형',
          furnitures: [{ id: 901, label: '테스트 티테이블' }],
        },
      ],
    }),
    'GET /api/v2/dashboard/categories': success({
      categories: [
        { categoryId: 1, nameEng: 'BED', nameKr: '침대', furnitures: [] },
        { categoryId: 2, nameEng: 'SOFA', nameKr: '소파', furnitures: [] },
        { categoryId: 3, nameEng: 'STORAGE', nameKr: '수납', furnitures: [] },
        {
          categoryId: 4,
          nameEng: 'TABLE',
          nameKr: '테이블',
          furnitures: [
            { id: 901, code: 'TEST_TABLE', label: '테스트 티테이블' },
          ],
        },
        { categoryId: 5, nameEng: 'SELECTIVE', nameKr: '기타', furnitures: [] },
        {
          categoryId: 6,
          nameEng: 'LIGHTING',
          nameKr: '조명',
          furnitures: [
            { id: 903, code: 'TEST_LIGHT', label: '테스트 조명' },
            { id: 904, code: 'TEST_UNUSED_LIGHT', label: '선택하지 않을 조명' },
          ],
        },
      ],
    }),
    'GET /api/v1/mypage/user': success({
      userId: 2002,
      name: '회귀테스트',
      CreditCount: 100,
      email: 'regression@example.invalid',
    }),
    'GET /api/v2/jjyms': success({ items: [] }),
    'GET /api/v1/landings': success({ landings: [] }),
    'GET /api/v1/other-styles?size=4': success({ otherStyles: [] }),
    'GET /api/v1/price-compare/presets': success({ presets: [] }),
    'GET /api/v1/price-compare/jobs/refresh-job': success({
      jobId: 'refresh-job',
      status: 'DONE',
      originalProduct: {
        title: '새로고침 검색 상품',
        imageUrl: imagePath('carousel'),
        price: 120000,
        brand: '테스트 브랜드',
      },
      result: {
        totalCount: 1,
        similarProducts: [
          {
            source: 'RAW',
            productId: 'compare-1',
            title: '비슷한 상품',
            imageUrl: imagePath('result9001'),
            price: 100000,
            productUrl: 'https://similar.example.invalid/product/1',
          },
        ],
      },
    }),
    'GET /api/v2/carousels': success({
      carousels: [{ rawProductId: 6001, url: imagePath('carousel') }],
    }),
    ['GET /api/v2/generated-images/' + image + '/curations/categories']:
      success({ categories: [{ id: 11, categoryName: '테스트 추천' }] }),
    ['GET /api/v1/generated-images/' + image + '/curations/products/11']:
      success({ userName: '회귀테스트', products: [] }),
    ['GET /api/v1/generated-images/' + image + '/meta']: success({
      imageId: image,
      imageUrl: imagePath('result' + image),
      isMirror: false,
      generationType: 'FULL_FUNNEL',
    }),
  };
  return replies;
}
