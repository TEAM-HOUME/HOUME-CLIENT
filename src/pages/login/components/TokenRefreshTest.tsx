// 엑세스 토큰 만료 및 리프레시 토큰 재발급 테스트용 컴포넌트

import { HTTPMethod, request } from '@/shared/apis/request';

const TokenRefreshTest = () => {
  const getTokenTest = async () => {
    try {
      await request({
        method: HTTPMethod.GET,
        url: '/access-test',
      });

      // console.log('API 응답');
    } catch (err: any) {
      console.error('API 요청 에러:', err);
    }
  };

  return (
    <div>
      <button onClick={getTokenTest}>토큰 만료 테스트</button>
    </div>
  );
};

export default TokenRefreshTest;
