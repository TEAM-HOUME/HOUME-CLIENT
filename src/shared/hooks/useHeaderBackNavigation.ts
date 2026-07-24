import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

// 어느 화면에서 뒤로가기를 누르느냐
type BackNavigationSource = 'result' | 'funnel-houseInfo' | 'funnel-other';

export const useHeaderBackNavigation = (
  source: BackNavigationSource
): (() => void) => {
  const navigate = useNavigate();

  const handleBackClick = useCallback(() => {
    switch (source) {
      // 뒤로가기를 누른 화면(source)에 따라 뒤로가기 목적지 분기 처리
      case 'result':
        // 결과 페이지: C-1에서 경로(FLOW_CONFIG)별 세부 분기 추가 예정
        navigate(ROUTES.HOME);
        break;

      case 'funnel-houseInfo':
        // 퍼널 첫 스텝: 기존 동작 유지 (navigate(-1)). C-1에서 목적지 명시 예정
        navigate(-1);
        break;

      case 'funnel-other':
        // 퍼널 나머지 스텝: 이전 스텝으로
        navigate(-1);
        break;
    }
  }, [source, navigate]);

  return handleBackClick;
};
