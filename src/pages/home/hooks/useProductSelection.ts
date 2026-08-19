import { useCallback, useEffect, useRef, useState } from 'react';

import type { SelectedProduct } from '@pages/home/types/productTab';

import { TOAST_MESSAGE } from '@shared/constants/toastMessage';
import { TOAST_TYPE, TOASTER_ID } from '@shared/types/toast';

import { useToast } from '@components/toast/useToast';

/**
 * 상품 선택 상한값 - 최대 6개 선택
 */
export const MAX_SELECTED_PRODUCTS = 6;

interface UseProductSelectionOptions {
  /**
   * 상품 탭 mount 시 selectedProducts state의 초기값으로 주입할 상품 목록
   * - 로그인 게이트 복귀 / ResultPage '상품 다시 선택하기'로부터 상품 탭 진입 등 외부에서 ProductTab 상태 복원이 필요한 경우 사용
   * - 빈 배열이면 기존 동작과 동일
   */
  initialSelectedProducts?: SelectedProduct[];
}

/**
 * 상품 선택 상태 전용 훅
 * - 선택/해제
 * - 최대 개수 제한
 * - 선택 관련 토스트
 * 를 한 곳에서 관리
 */
const useProductSelection = ({
  initialSelectedProducts = [],
}: UseProductSelectionOptions = {}) => {
  /** 현재 선택된 상품 목록 */
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    initialSelectedProducts
  );
  const selectedProductsRef = useRef<SelectedProduct[]>(
    initialSelectedProducts
  );
  const { notify } = useToast();

  useEffect(() => {
    selectedProductsRef.current = selectedProducts;
  }, [selectedProducts]);

  /**
   * 상품 선택 핸들러
   * - 중복 선택 방지
   * - 최대 개수 초과 시 추가하지 않고 토스트 안내
   */
  const handleSelectProduct = useCallback(
    (product: SelectedProduct) => {
      const currentSelected = selectedProductsRef.current;
      if (currentSelected.some((item) => item.id === product.id)) return;
      if (currentSelected.length >= MAX_SELECTED_PRODUCTS) {
        notify({
          text: TOAST_MESSAGE.PRODUCT_SELECT_MAX_LIMIT,
          type: TOAST_TYPE.INFO,
          options: { toasterId: TOASTER_ID.TOP_4 },
        });
        return;
      }

      setSelectedProducts((prev) => {
        if (prev.some((item) => item.id === product.id)) return prev;
        if (prev.length >= MAX_SELECTED_PRODUCTS) return prev;
        return [...prev, product];
      });
    },
    [notify]
  );

  /** 선택된 상품 1개 제거 */
  const handleRemoveSelectedProduct = useCallback((id: number) => {
    setSelectedProducts((prev) => prev.filter((product) => product.id !== id));
  }, []);

  /**
   * - "이 상품들로 우리 집 꾸미기" CTA 클릭 핸들러는 navigate/auth/store 의존성이 추가로 필요해 useProductTabController에서 본구현 (로그인 게이트 / ResultPage에서 상품 탭 진입 시 navigate/auth/stor로부터 selectedProduct를 복구해야 함)
   */

  return {
    selectedProducts,
    handleSelectProduct,
    handleRemoveSelectedProduct,
  };
};

export { useProductSelection };
