# analytics/utils/screenName

GA `screen_name` / `return_screen_name` — 라우트 스택 기반.

파일명 규칙: `동사 + ScreenNameStack` / `ReturnScreenParams` / `resolveScreenName`

| 파일                    | 역할                                             |
| ----------------------- | ------------------------------------------------ |
| resolveScreenName       | URL → screen_name 변환                           |
| updateScreenNameStack   | 라우트 변경 시 previous·current screen_name 갱신 |
| buildReturnScreenParams | 스택 기반 `return_screen_name` params 조립       |

`SCREEN_NAME` 상수는 `@analytics/screenNames`에, 이미지 퍼널의 return_screen_name은 `imageFlow/resolveFunnelReturnScreen`에 있다.
