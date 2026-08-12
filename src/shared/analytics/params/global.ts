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

/** 경로 — screen_name / return_screen_name / previous_screen_name */
export type AnalyticsScreenName = ScreenName | (string & {});
