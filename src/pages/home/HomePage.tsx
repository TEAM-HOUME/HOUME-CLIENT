import TokenRefreshTest from '../login/components/TokenRefreshTest';
import ChargeButton from '@/shared/components/button/chargeButton/chargeBtn';

const HomePage = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <ChargeButton>충전하기</ChargeButton>
      <TokenRefreshTest />
    </div>
  );
};

export default HomePage;
