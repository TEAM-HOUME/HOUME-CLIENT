/**
 * 로그아웃 버튼 컴포넌트
 *
 * 사용자 로그아웃을 처리하는 재사용 가능한 버튼 컴포넌트입니다.
 * 클릭 시 사용자 확인 후 로그아웃을 실행합니다.
 *
 *
 */
import { useLogoutMutation } from '../apis/logout';

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export const LogoutButton = ({
  children = '로그아웃',
  className,
}: LogoutButtonProps) => {
  const { mutate: logout, isPending } = useLogoutMutation();
  // Tanstack Query - useLogoutMutation 훅 호출

  const handleLogout = () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      logout(); // 로그아웃 함수 호출
    }
  };

  return (
    <button onClick={handleLogout} disabled={isPending} className={className}>
      {isPending ? '로그아웃 중...' : children}
    </button>
  );
};
