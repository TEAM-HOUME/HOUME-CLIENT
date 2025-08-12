import TitleNavBar from '@/shared/components/navBar/TitleNavBar';

interface FunnelLayoutProps {
  children: React.ReactNode;
}

const FunnelLayout = ({ children }: FunnelLayoutProps) => {
  return (
    <div>
      <TitleNavBar
        title="스타일링 이미지 생성"
        isBackIcon={true}
        isLoginBtn={false}
      />
      <div>{children}</div>
    </div>
  );
};

export default FunnelLayout;
