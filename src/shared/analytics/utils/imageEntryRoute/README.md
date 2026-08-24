# analytics/utils/imageEntryRoute

GA `image_entry_route` — 이미지 퍼널 진입 경로.

파일명 규칙: `동사 + ImageEntryRoute`

| 파일                | 역할                                             |
| ------------------- | ------------------------------------------------ |
| mapImageEntryRoute  | ENTRY_ROUTE → GA enum 매핑 (이 매핑의 기준 원문) |
| readImageEntryRoute | flow store에서 `getEntryRoute()`로 조회          |
