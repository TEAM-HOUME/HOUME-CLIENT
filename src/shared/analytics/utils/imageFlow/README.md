# analytics/utils/imageFlow

이미지 퍼널 GA 유틸. `screenName/`(라우트 스택 기준)과는 별개로, image_entry_route와 퍼널 스텝을 기준으로 동작한다.

파일명 규칙: `동사 + Funnel{목적}` (목적어를 `Funnel`로 통일)

| 파일                            | 역할                                                        |
| ------------------------------- | ----------------------------------------------------------- |
| captureFunnelInputSnapshot      | 생성 mutation 전에 퍼널 입력값을 백업하고 조회              |
| resolveFunnelReturnScreen       | roomType·loadImg·shop 등의 funnel `return_screen_name` 결정 |
| formatFunnelGaParams            | API·도메인 값을 GA param enum·문자열로 변환                 |
| buildFunnelResultPageViewParams | resultRec·resultList의 `page_view` params 조립              |
