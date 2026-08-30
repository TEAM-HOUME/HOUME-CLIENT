/** 게이트 — login_entry_route */
export const LOGIN_ENTRY_ROUTE = {
  TOP_NAV_LOGIN: 'top_nav_login',
  TOP_NAV_GENERATE: 'top_nav_generate',
  HOME_BANNER: 'home_banner',
  HOME_SPACE: 'home_space',
  HOME_STYLE: 'home_style',
  SHOP_GENERATE: 'shop_generate',
  PRODUCT_CARD_SAVE: 'product_card_save',
  PRODUCT_CARD_SITE: 'product_card_site',
  PRODUCT_LIST_SAVE: 'product_list_save',
  PRODUCT_LIST_SITE: 'product_list_site',
  COMPARE_SEARCH: 'compare_search',
} as const;

export type LoginEntryRoute =
  (typeof LOGIN_ENTRY_ROUTE)[keyof typeof LOGIN_ENTRY_ROUTE];

/** 게이트 — image_entry_route */
export const IMAGE_ENTRY_ROUTE = {
  TOP_NAV: 'top_nav',
  HOME_BANNER: 'home_banner',
  HOME_SPACE: 'home_space',
  HOME_STYLE: 'home_style',
  SHOP: 'shop',
  SHOP_REGENERATE: 'shop_regenerate',
  /** 마이페이지 생성 이미지 목록 → 결과 페이지 (퍼널 스냅샷 없음) */
  MYPAGE: 'mypage',
} as const;

export type ImageEntryRoute =
  (typeof IMAGE_ENTRY_ROUTE)[keyof typeof IMAGE_ENTRY_ROUTE];
