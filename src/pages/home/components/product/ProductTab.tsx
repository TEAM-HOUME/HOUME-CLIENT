import { useEffect, useState } from 'react';

import { overlay } from 'overlay-kit';

import { useProductShopAnalytics } from '@pages/home/analytics/useProductShopAnalytics';
import ProductFilterSheet from '@pages/home/components/product/ProductFilterSheet/ProductFilterSheet';
import {
  MAX_SELECTED_PRODUCTS,
  useProductTabController,
} from '@pages/home/hooks/useProductTabController';
import { useSheetMinimizeOnScroll } from '@pages/home/hooks/useSheetMinimizeOnScroll';
import { consumeReopenProduct } from '@pages/home/utils/productDetailOverlayReopen';

import { useConsumeProductRestore } from '@store/imageFlow/useConsumeProductRestore';

import CloseBottomSheet from '@shared/components/v2/bottomSheet/CloseBottomSheet';
import DragHandleBottomSheet from '@shared/components/v2/bottomSheet/DragHandleBottomSheet';
import ActionButton from '@shared/components/v2/button/actionButton/ActionButton';

import ProductDetailOverlay from './ProductPopup/ProductDetailOverlay';
import * as styles from './ProductTab.css';
import SearchSection from './SearchSection/SearchSection';
import SelectedProductSheet from './SelectedProductSheet/SelectedProductSheet';
import {
  PRODUCT_BOTTOM_SHEET_COLLAPSED_HEIGHT,
  PRODUCT_BOTTOM_SHEET_MINIMIZED_HEIGHT,
} from '../../constants/productTab';

const ProductTab = () => {
  const productsToBeRestored = useConsumeProductRestore();
  const hasProductsToBeRestored = productsToBeRestored.length > 0;

  const [productCountViewed, setProductCountViewed] = useState(0);

  const controller = useProductTabController({
    initialSelectedProducts: productsToBeRestored,
    initialSheetExpanded: hasProductsToBeRestored,
    resetFiltersOnMount: hasProductsToBeRestored,
  });

  const {
    sheetExpanded,
    filterSheetOpen,
    chipSelected,
    appliedFilterChips,
    selectedProducts,
    furnitureSubCategoryByNameKr,
    filterSheetProps,
    keyword,
    products,
    recommendedProducts,
    isRecommended,
    showEmptyState,
    isPending,
    isError,
    refetch,
    loadMoreRef,
    handleSearchKeywordChange,
    handleRemoveAppliedChip,
    handleFilterSheetClose,
  } = controller;

  // 스크롤 다운 시 시트 축소(핸들+썸네일만) / 스크롤 업 시 복원
  // default 높이 & 스크롤 가능한 구간에서만 활성화
  const { minimized: sheetCollapsed, restore: restoreSheet } =
    useSheetMinimizeOnScroll({ active: !filterSheetOpen && !sheetExpanded });

  const {
    shopListContext,
    setSheetExpanded,
    handleProductListRender,
    handleFilterChipClick,
    handleFilterApply,
    handleFilterResetClick,
    handleSelectProduct,
    handleSelectProductFromDetailModal,
    handleRemoveSelectedProduct,
    handleAddProductClick,
    handleDecorateWithProductsClick,
    handleSearchBarClick,
    handleSearchClear,
    handleSelectSheetItemClick,
  } = useProductShopAnalytics(controller, {
    productCountViewed,
    onProductViewedCountChange: setProductCountViewed,
    sheetCollapsed,
  });

  useEffect(() => {
    const reopen = consumeReopenProduct();
    if (!reopen) return;

    overlay.open(({ unmount }) => (
      <ProductDetailOverlay
        unmount={unmount}
        id={reopen.id}
        product={reopen.product}
        price={reopen.price}
        link={{ href: reopen.linkHref }}
        save={{ isSaved: false, onToggle: () => {} }}
        shoppingAction={{
          label: '선택',
          disabled: selectedProducts.some((p) => p.id === reopen.id),
        }}
        onConfirmSelect={() => {
          if (selectedProducts.some((p) => p.id === reopen.id)) return;

          handleSelectProductFromDetailModal({
            id: reopen.id,
            title: reopen.product.title,
            brand: reopen.product.brand ?? '',
            imageUrl: reopen.product.imageUrl,
            originalPrice: reopen.price?.original ?? 0,
            discountPrice: reopen.price?.discount ?? 0,
            discountRate: reopen.price?.discountRate ?? 0,
          });
        }}
      />
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      {/* <IntroSection /> */}
      <SearchSection
        chipSelected={chipSelected}
        onFilterChipClick={handleFilterChipClick}
        appliedFilterChips={appliedFilterChips}
        onAppliedFilterChipRemove={handleRemoveAppliedChip}
        selectedProductIds={selectedProducts.map((product) => product.id)}
        onSelectProduct={handleSelectProduct}
        onSelectProductFromDetailModal={handleSelectProductFromDetailModal}
        furnitureSubCategoryByNameKr={furnitureSubCategoryByNameKr}
        keyword={keyword}
        products={products}
        recommendedProducts={recommendedProducts}
        isRecommended={isRecommended}
        showEmptyState={showEmptyState}
        isPending={isPending}
        isError={isError}
        refetch={refetch}
        loadMoreRef={loadMoreRef}
        shopListContext={shopListContext}
        onSearchKeywordChange={handleSearchKeywordChange}
        onSearchBarClick={handleSearchBarClick}
        onSearchClear={handleSearchClear}
        onProductListRender={handleProductListRender}
      />

      <DragHandleBottomSheet
        open={!filterSheetOpen}
        collapsedHeight={PRODUCT_BOTTOM_SHEET_COLLAPSED_HEIGHT}
        minimizedHeight={PRODUCT_BOTTOM_SHEET_MINIMIZED_HEIGHT}
        minimized={sheetCollapsed}
        onRestoreFromMinimized={restoreSheet}
        expanded={sheetExpanded}
        onExpandedChange={setSheetExpanded}
        contentSlot={
          <SelectedProductSheet
            expanded={sheetExpanded}
            minimized={sheetCollapsed}
            selectedProducts={selectedProducts}
            onRemoveProduct={handleRemoveSelectedProduct}
            onAddProductClick={handleAddProductClick}
            onItemClick={handleSelectSheetItemClick}
            maxCount={MAX_SELECTED_PRODUCTS}
          />
        }
        primaryButton={
          <ActionButton
            size="2XL"
            fullWidth
            leftIcon="DoubleStar"
            visualDisabled={selectedProducts.length === 0}
            onClick={handleDecorateWithProductsClick}
          >
            이 상품들로 우리 집 꾸미기
          </ActionButton>
        }
      />

      <CloseBottomSheet
        open={filterSheetOpen}
        onClose={handleFilterSheetClose}
        titleAlign="left"
        titleSlot={<p className={styles.filterSheetTitle}>필터</p>}
        contentSlot={<ProductFilterSheet {...filterSheetProps} />}
        secondaryButton={
          <ActionButton
            variant="outlined"
            color="inverse"
            size="2XL"
            leftIcon="Refresh"
            onClick={handleFilterResetClick}
          >
            초기화
          </ActionButton>
        }
        primaryButton={
          <ActionButton size="2XL" fullWidth onClick={handleFilterApply}>
            필터 적용하기
          </ActionButton>
        }
      />
    </div>
  );
};

export default ProductTab;
