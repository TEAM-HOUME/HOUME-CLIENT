# analytics/utils/loginEntryRoute

GA `login_entry_route` — 로그인 게이트 진입 경로.

파일명 규칙: `동사 + LoginEntryRoute` (params 조립은 `LoginSocialEventParams`)

| 파일                        | 역할                                                 |
| --------------------------- | ---------------------------------------------------- |
| storeLoginEntryRoute        | sessionStorage 저장·조회·삭제                        |
| mapLoginEntryRoute          | ENTRY_ROUTE → GA enum 매핑                           |
| buildLoginSocialEventParams | 로그인 플로우 이벤트 params (`getLoginSocialParams`) |
