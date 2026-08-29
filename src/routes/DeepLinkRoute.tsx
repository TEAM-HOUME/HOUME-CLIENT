import { Navigate, useLocation } from 'react-router-dom';

import { COMPARE_PRODUCT_URL_PARAM } from '@pages/home/hooks/usePriceCompareJob';
import { restoreDeepLinkUrl } from '@pages/home/utils/deepLinkUrl';
import NotFoundPage from '@pages/notFound/NotFoundPage';

import { ROUTES } from '@routes/paths';

/**
 * `path: '*'`에 걸리는 컴포넌트. 등록된 라우트와 하나도 맞지 않는 주소로 들어왔을 때 렌더된다.
 *
 * `houme.kr/https://29cm.co.kr/product/123`처럼 상품 URL을 뒤에 붙여 들어온 요청이면 원본 URL을 복원해 비교 탭으로 넘기고, 아니면 NotFound를 보여준다.
 *
 * 이동은 push가 아니라 replace다. 딥링크로 들어온 사람에게 이전 항목은 하우미가 아니라 직전에 보던 사이트이므로, 뒤로가기 시 그쪽으로 나가야 한다.
 */
const DeepLinkRoute = () => {
  const location = useLocation();
  const productUrl = restoreDeepLinkUrl(location);

  if (!productUrl) return <NotFoundPage />;

  const compareTabPath = `${ROUTES.HOME}?tab=compare&${COMPARE_PRODUCT_URL_PARAM}=${encodeURIComponent(productUrl)}`;

  return <Navigate to={compareTabPath} replace />;
};

export default DeepLinkRoute;
