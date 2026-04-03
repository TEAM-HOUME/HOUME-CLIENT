import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { ENTRY_ROUTE, useImageFlowStore } from '@store/useImageFlowStore';
import { useUserStore } from '@store/useUserStore';

import { setLoginRedirect } from '@utils/loginRedirect';

const BannerDetailPage = () => {
  const { bannerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!useUserStore((state) => state.accessToken);

  // 배너 상세 CTA: setFlow(HOME_BANNER) → 로그인 체크 → 배너 상세로 복귀
  const handleCta = () => {
    const parsedId = Number(bannerId);
    if (Number.isNaN(parsedId)) return;

    useImageFlowStore.getState().setFlow({
      entryRoute: ENTRY_ROUTE.HOME_BANNER,
      // TODO: answerId는 배너 상세 UI 구현 후 실제 칩 선택값으로 교체
      preset: { type: 'banner', bannerId: parsedId, answerId: 0 },
    });

    if (isLoggedIn) {
      navigate(ROUTES.IMAGE_SETUP);
    } else {
      // pathname과 쿼리 파라미터 모두 저장
      setLoginRedirect(location.pathname + location.search);
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <div>
      <div>배너 상세 페이지 / bannerId: {bannerId}</div>
      <button onClick={handleCta}>이 스타일로 우리 집 꾸미기</button>
    </div>
  );
};

export default BannerDetailPage;
