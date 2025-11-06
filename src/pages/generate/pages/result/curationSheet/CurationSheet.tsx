import { useEffect, useMemo } from 'react';

import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import FilterChip from '@/pages/generate/components/filterChip/FilterChip';
import {
  useActiveImageCurationState,
  useActiveImageId,
  useGeneratedCategoriesQuery,
  useGeneratedProductsQuery,
  useSheetSnapState,
} from '@/pages/generate/hooks/useFurnitureCuration';
import { useCurationStore } from '@/pages/generate/stores/useCurationStore';
import { useGetJjymListQuery } from '@/pages/mypage/hooks/useSaveItemList';
import { ROUTES } from '@/routes/paths';
import { useSavedItemsStore } from '@/store/useSavedItemsStore';
import { useUserStore } from '@/store/useUserStore';

import CardProductItem from './CardProductItem';
import * as styles from './CurationSheet.css';
import { CurationSheetWrapper } from './CurationSheetWrapper';

export const CurationSheet = () => {
  // 전역상태 사용
  const displayName = useUserStore((state) => state.userName ?? '사용자');
  const activeImageId = useActiveImageId();
  const imageState = useActiveImageCurationState();
  const selectedCategoryId = imageState?.selectedCategoryId ?? null;
  const selectCategory = useCurationStore((state) => state.selectCategory);
  const { snapState, setSnapState } = useSheetSnapState();

  const navigate = useNavigate();

  const handleGotoMypage = () => {
    navigate(ROUTES.MYPAGE);
  };

  const categoriesQuery = useGeneratedCategoriesQuery(activeImageId ?? null);
  const productsQuery = useGeneratedProductsQuery(
    activeImageId ?? null,
    selectedCategoryId
  );

  const categories = categoriesQuery.data?.categories ?? [];
  const productsData = productsQuery.data?.products;
  const headerName = productsQuery.data?.userName ?? displayName;

  const normalizedProducts = useMemo(
    () =>
      (productsData ?? []).map((product, index) => {
        const derivedId =
          (product.furnitureProductId && Number(product.furnitureProductId)) ||
          index + 1;
        return {
          id: derivedId,
          furnitureProductId: derivedId,
          furnitureProductName: product.furnitureProductName,
          furnitureProductMallName: product.furnitureProductMallName,
          furnitureProductImageUrl:
            product.furnitureProductImageUrl || product.baseFurnitureImageUrl,
          furnitureProductSiteUrl: product.furnitureProductSiteUrl,
        };
      }),
    [productsData]
  );

  // 서버 찜 목록 불러오기
  const { data: jjymItems = [] } = useGetJjymListQuery();
  const setSavedProductIds = useSavedItemsStore((s) => s.setSavedProductIds);

  useEffect(() => {
    // 추천ID(recommendId) 기준으로 맞춰서 넣기
    const ids = jjymItems.map((item) => item.id);
    setSavedProductIds(ids);
  }, [jjymItems, setSavedProductIds]);

  useEffect(() => {
    if (activeImageId === null && snapState !== 'collapsed') {
      setSnapState('collapsed');
    }
  }, [activeImageId, snapState, setSnapState]);

  const activeHotspotLabel = useMemo(() => {
    if (!imageState?.hotspots?.length) return null;
    const targetId = imageState.selectedHotspotId;
    if (!targetId) return imageState.hotspots[0]?.finalLabel ?? null;
    return (
      imageState.hotspots.find((item) => item.id === targetId)?.finalLabel ??
      null
    );
  }, [imageState]);

  const handleCategorySelect = (categoryId: number) => {
    if (activeImageId === null) return;
    if (selectedCategoryId === categoryId) return;
    selectCategory(activeImageId, categoryId);
  };

  const renderStatus = (
    message: string,
    description?: string,
    action?: { label: string; onClick: () => void }
  ) => (
    <div className={styles.statusContainer}>
      <p className={styles.statusMessage}>{message}</p>
      {description && <p className={styles.statusSubMessage}>{description}</p>}
      {action && (
        <button
          type="button"
          className={styles.statusButton}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );

  const renderProductSection = () => {
    if (activeImageId === null) {
      return renderStatus(
        '가구 추천을 보려면 생성된 이미지를 먼저 선택해 주세요',
        '결과 이미지에서 핫스팟을 선택하면 추천이 표시돼요'
      );
    }
    if (categoriesQuery.isLoading) {
      return renderStatus(
        '감지된 가구를 분석 중이에요',
        '잠시만 기다려 주세요'
      );
    }
    if (categoriesQuery.isError) {
      return renderStatus(
        '가구 카테고리를 불러오지 못했어요',
        '네트워크 상태를 확인한 뒤 다시 시도해 주세요',
        { label: '다시 불러오기', onClick: () => categoriesQuery.refetch() }
      );
    }
    if (categories.length === 0) {
      return renderStatus(
        '감지된 가구가 없어 추천을 제공할 수 없어요',
        '다른 이미지를 생성하거나 핫스팟을 다시 선택해 주세요'
      );
    }
    if (!selectedCategoryId) {
      return renderStatus(
        '추천받을 가구 카테고리를 선택해 주세요',
        '상단 필터에서 원하는 가구를 골라 주세요'
      );
    }
    if (productsQuery.isLoading) {
      return renderStatus(
        '선택한 가구에 맞는 상품을 찾는 중이에요',
        '곧 추천을 보여드릴게요'
      );
    }
    if (productsQuery.isError) {
      return renderStatus(
        '추천 상품을 불러오지 못했어요',
        '잠시 후 다시 시도해 주세요',
        { label: '다시 불러오기', onClick: () => productsQuery.refetch() }
      );
    }
    if (normalizedProducts.length === 0) {
      return renderStatus(
        '선택한 카테고리에 맞는 상품이 없어요',
        '다른 카테고리를 선택해 보세요'
      );
    }
    return (
      <div className={styles.gridbox}>
        {normalizedProducts.map((product) => (
          <CardProductItem
            key={product.furnitureProductId}
            product={product}
            onGotoMypage={handleGotoMypage}
          />
        ))}
      </div>
    );
  };

  return (
    <CurationSheetWrapper
      snapState={snapState}
      onSnapStateChange={setSnapState}
    >
      {(snapState) => (
        <>
          <div className={styles.filterSection}>
            {categories.length === 0 && !categoriesQuery.isLoading ? (
              <FilterChip disabled>감지된 가구 없음</FilterChip>
            ) : (
              categories.map((category) => (
                <FilterChip
                  key={category.id}
                  isSelected={selectedCategoryId === category.id}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {category.categoryName}
                </FilterChip>
              ))
            )}
          </div>
          <div
            className={clsx(
              styles.scrollContentBase,
              styles.scrollContentArea[
                snapState === 'expanded' ? 'expanded' : 'mid'
              ]
            )}
          >
            <p className={styles.headerText}>
              {headerName}님의 취향에 딱 맞는 가구 추천
              {activeHotspotLabel ? ` · ${activeHotspotLabel}` : ''}
            </p>
            {/* 그리드 영역 */}
            <div className={styles.curationSection}>
              {renderProductSection()}
            </div>
          </div>
        </>
      )}
    </CurationSheetWrapper>
  );
};
