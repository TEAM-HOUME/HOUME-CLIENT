import { Outlet, useLocation, useNavigate, useMatch } from 'react-router-dom';
import TitleNavBar from '@/shared/components/navBar/TitleNavBar';

const GeneratePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isBackIcon = useMatch('/generate/result');

  // 현재 경로에 따라 뒤로가기 로직 결정
  const handleBackClick = () => {
    if (location.pathname === '/generate/result') {
      // ResultPage에서는 랜딩페이지로 이동
      navigate('/');
    } else {
      // 그 외의 경우 (LoadingPage 등)는 한 단계 이전으로 이동
      navigate(-1);
    }
  };

  return (
    <main>
      <TitleNavBar
        title={'스타일링 이미지 생성'}
        isBackIcon={!!isBackIcon}
        isLoginBtn={false}
        onBackClick={handleBackClick}
      />
      <Outlet />
    </main>
  );
};

export default GeneratePage;
