import { useNavigate, useLocation, useParams } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { ENTRY_ROUTE, useImageFlowStore } from '@store/useImageFlowStore';
import { useUserStore } from '@store/useUserStore';

import { setLoginRedirect } from '@utils/loginRedirect';

const StyleDetailPage = () => {
  const { styleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!useUserStore((state) => state.accessToken);

  // 스타일 상세 CTA: setFlow(STYLE_RESTYLE) → 로그인 체크 → 스타일 상세로 복귀
  const handleCta = () => {
    const parsedId = Number(styleId);
    if (Number.isNaN(parsedId)) return;

    useImageFlowStore.getState().setFlow({
      entryRoute: ENTRY_ROUTE.STYLE_RESTYLE,
      preset: { type: 'style', styleId: parsedId },
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
      <div>스타일 상세 페이지 / styleId: {styleId}</div>
      <button onClick={handleCta}>이 스타일로 우리 집 꾸미기</button>
    </div>
  );
};

export default StyleDetailPage;
