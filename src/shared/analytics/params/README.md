# analytics/params

GA4 파라미터 enum·타입 정의 (노션 스펙 v2.0.0 기준).

런타임 배선은 `analytics/utils/` 아래에 있고 여기에는 값·타입 정의만 둔다.

```typescript
import { LOGIN_ENTRY_ROUTE } from '@analytics/params/auth';
import type { TrackEventParams } from '@analytics/params/types';
```

파일은 GA 영역별로 나뉜다: `auth` · `bannerDetail` · `gate` · `global` · `homeContent` · `imageSetup` · `landing` · `path` · `product` · `productCard` · `result` · `scrollDepth` · `shop` · `space` · `toast` · `types`, 그리고 이벤트 params 조립 함수는 `builders/`.
