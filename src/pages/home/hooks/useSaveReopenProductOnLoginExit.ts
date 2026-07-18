import { useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';

import {
  setReopenProduct,
  type ReopenProduct,
} from '@pages/home/utils/productDetailOverlayReopen';

import { ROUTES } from '@routes/paths';

/**
 * 상품 상세 오버레이가 열린 뒤 다른 경로로 이동하면 오버레이를 닫는다.
 * 그 이동이 로그인 페이지로의 이탈이면(로그인 게이트·세션 만료 강제 이동 모두 포함) 닫기 직전에 재오픈 정보를 저장해, 재로그인 후 같은 상품 상세를 다시 띄울 수 있게 한다.
 *
 * pathname이 LOGIN으로 바뀌는 걸 감시하므로, requireLogin뿐 아니라 globalErrorHandler의 세션 만료 강제 리다이렉트도 저장 트리거에 걸린다.
 *
 * @param unmount 오버레이를 닫는 함수
 * @param getReopenData 저장할 재오픈 정보를 그 시점 최신값으로 돌려주는 함수(ref 기반 안정 참조)
 */
export const useSaveReopenProductOnLoginExit = ({
  unmount,
  getReopenData,
}: {
  unmount: () => void;
  getReopenData: () => ReopenProduct;
}): void => {
  const location = useLocation();
  const openedPathRef = useRef(location.pathname);

  useEffect(() => {
    // 오버레이를 연 그 경로에 그대로 있으면(아직 이동 안 함) 아무것도 안 함
    if (location.pathname === openedPathRef.current) return;

    // 로그인 페이지로 이탈하는 경우에만 재오픈 정보 저장 (그 외 이동은 그냥 닫기)
    if (location.pathname === ROUTES.LOGIN) {
      setReopenProduct(getReopenData());
    }
    unmount();
  }, [location.pathname, unmount, getReopenData]);
};
