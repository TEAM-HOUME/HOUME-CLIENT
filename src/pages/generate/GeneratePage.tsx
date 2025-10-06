import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
  useMatch,
} from 'react-router-dom';

import TitleNavBar from '@/shared/components/navBar/TitleNavBar';

const GeneratePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBackIcon = useMatch('/generate/result');

  // 마이페이지에서 온 경우 체크
  const from = searchParams.get('from');
  const isFromMypage = from === 'mypage';

  // 조건부 타이틀 설정
  const title = '이미지 생성 완료';

  // 현재 경로에 따라 뒤로가기 로직 결정
  const handleBackClick = () => {
    if (location.pathname === '/generate/result') {
      if (isFromMypage) {
        // 마이페이지에서 온 경우 마이페이지로 이동
        navigate('/mypage');
      } else {
        // 일반 생성 플로우에서는 랜딩페이지로 이동
        navigate('/');
      }
    } else {
      // 그 외의 경우 (LoadingPage 등)는 한 단계 이전으로 이동
      navigate(-1);
    }
  };

  return (
    <main>
      <TitleNavBar
        title={title}
        isBackIcon={!!isBackIcon}
        isLoginBtn={false}
        onBackClick={handleBackClick}
      />
      <Outlet />
    </main>
  );
};

export default GeneratePage;
