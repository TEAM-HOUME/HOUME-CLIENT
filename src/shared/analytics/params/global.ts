import type { ScreenName } from '@analytics/screenNames';

/** 유저 상태 — is_new_user */
export const IS_NEW_USER = {
  TRUE: true,
  FALSE: false,
} as const;

export type IsNewUser = boolean;

/** 유저 상태 — login_status */
export const LOGIN_STATUS = {
  LOGGED_IN: 'logged_in',
  LOGGED_OUT: 'logged_out',
} as const;

export type LoginStatus = (typeof LOGIN_STATUS)[keyof typeof LOGIN_STATUS];

/**
 * 정해진 리터럴 목록을 자동완성으로 보여주면서, 목록 밖 문자열도 허용한다.
 *
 * 그냥 `ScreenName | string`으로 쓰면 TypeScript가 리터럴을 string에 흡수해서
 * 타입이 통째로 string이 된다 — 자동완성도 사라지고 어떤 값이 정상인지도 안 보인다.
 * `string & {}`는 흡수를 막는 관용구다. 이 표기는 여기 한 곳에만 두고 아래 타입들로 쓴다.
 */
export type LooseLiteral<T extends string> = T | (string & {});

/** 경로 — screen_name / return_screen_name / previous_screen_name */
export type AnalyticsScreenName = LooseLiteral<ScreenName>;
