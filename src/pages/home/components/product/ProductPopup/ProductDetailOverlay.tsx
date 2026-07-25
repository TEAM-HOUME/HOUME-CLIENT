import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  trackShopFeedDetailMdCloseClick,
  trackShopFeedDetailMdGoSiteClick,
  trackShopFeedDetailMdSaveClick,
  trackShopFeedDetailMdSelectClick,
  trackShopFeedDetailMdUnsaveClick,
  trackShopFeedDetailMdView,
} from '@pages/home/analytics/shopAnalytics';
import { useProductDetailQuery } from '@pages/home/apis/queries/useProductDetailQuery';
import { useSaveReopenProductOnLoginExit } from '@pages/home/hooks/useSaveReopenProductOnLoginExit';

import { ROUTES } from '@routes/paths';

import { useSavedItemsStore } from '@store/useSavedItemsStore';

import { LOGIN_ENTRY_ROUTE } from '@shared/analytics/params/gate';
import type { ProductColorDetail } from '@shared/apis/__generated__/data-contracts';
import Popup from '@shared/components/v2/popup/Popup';
import type {
  LinkInfo,
  PriceInfo,
  ProductInfo,
  SaveInfo,
} from '@shared/types/productCard';

import { useJjymMutation } from '@apis/mutations/useJjymMutation';

import ProductDetailCard from './ProductDetailCard';

interface ProductDetailOverlayProps {
  unmount: () => void;
  id: number;
  product: ProductInfo;
  price?: PriceInfo;
  save: SaveInfo;
  link?: LinkInfo;
  shoppingAction?: {
    label?: string;
    disabled?: boolean;
  };
  onConfirmSelect?: () => void;
  selectedProductIds?: string;
  listCategoryName?: string;
}

const ProductDetailOverlay = ({
  unmount,
  id,
  product: listProduct,
  price: listPrice,
  save,
  link,
  shoppingAction,
  onConfirmSelect,
  selectedProductIds,
  listCategoryName,
}: ProductDetailOverlayProps) => {
  const navigate = useNavigate();
  const { data, isPending } = useProductDetailQuery(id);
  const detail = data?.product;
  const { mutate: toggleJjym } = useJjymMutation({
    loginEntryRoute: LOGIN_ENTRY_ROUTE.PRODUCT_CARD_SAVE,
    onSavedAction: () => {
      navigate(ROUTES.MYPAGE, { state: { activeTab: 'savedItems' } });
    },
  });
  const getSavedState = useSavedItemsStore((s) => s.getSavedState);
  const merged = useMemo(() => {
    const detailColorHexes =
      detail?.colors
        ?.map((colorDetail: ProductColorDetail) => colorDetail.value)
        .filter((colorHex): colorHex is string => Boolean(colorHex)) ?? [];

    const product: ProductInfo = {
      title: detail?.name ?? listProduct.title,
      brand: detail?.brand ?? listProduct.brand,
      imageUrl: detail?.imageUrl ?? listProduct.imageUrl,
      colorHexes:
        detailColorHexes.length > 0 ? detailColorHexes : listProduct.colorHexes,
    };

    const price: PriceInfo | undefined = detail
      ? {
          original: detail.originalPrice ?? listPrice?.original,
          discount: detail.finalPrice ?? listPrice?.discount,
          discountRate: detail.discountRate ?? listPrice?.discountRate,
        }
      : listPrice;

    const linkHrefOverride = detail?.linkUrl ?? link?.href;

    const saveCount =
      detail != null
        ? detail.jjymCount
        : save.count != null && save.count > 0
          ? save.count
          : undefined;

    return { product, price, linkHrefOverride, saveCount };
  }, [detail, link?.href, listPrice, listProduct, save.count]);

  const mergedRef = useRef(merged);
  mergedRef.current = merged;

  const categoryName = detail?.categoryName ?? listCategoryName;

  const isAlreadySelected =
    selectedProductIds
      ?.split(',')
      .some((productId) => productId.trim() === String(id)) ?? false;
  const isConfirmDisabled =
    shoppingAction?.disabled === true || isAlreadySelected;
  const confirmLabel =
    shoppingAction?.label ?? (isAlreadySelected ? '선택됨' : '선택');

  const isSaved = getSavedState(id, detail?.isLiked ?? save.isSaved);

  useEffect(() => {
    trackShopFeedDetailMdView();
  }, []);

  const handleSaveToggle = () => {
    if (isSaved) {
      trackShopFeedDetailMdUnsaveClick({
        id,
        title: merged.product.title,
      });
    } else {
      trackShopFeedDetailMdSaveClick({
        id,
        title: merged.product.title,
      });
    }

    toggleJjym(id, { productName: merged.product.title });
  };

  const handleClose = useCallback(() => {
    trackShopFeedDetailMdCloseClick();
    unmount();
  }, [unmount]);

  const handleConfirm = useCallback(() => {
    if (isConfirmDisabled) return;

    trackShopFeedDetailMdSelectClick(
      {
        id,
        title: merged.product.title,
        brand: merged.product.brand,
        discountPrice: merged.price?.discount,
        categoryName,
      },
      selectedProductIds
    );
    onConfirmSelect?.();
    unmount();
  }, [
    categoryName,
    id,
    isConfirmDisabled,
    merged,
    onConfirmSelect,
    selectedProductIds,
    unmount,
  ]);

  // 오버레이가 열린 뒤 로그인 페이지로 이탈하면, 닫기 직전에 재오픈 정보를 저장한다
  const getReopenData = useCallback(() => {
    const { product, price, linkHrefOverride } = mergedRef.current;
    return { id, product, price, linkHref: linkHrefOverride };
  }, [id]);

  useSaveReopenProductOnLoginExit({ unmount, getReopenData });

  return (
    <Popup
      btnStyle="solid"
      btnText={confirmLabel}
      confirmDisabled={isConfirmDisabled}
      onClose={handleClose}
      onCancel={handleSaveToggle}
      onConfirm={handleConfirm}
      showCloseButton
      sideIconName={isSaved ? 'HeartFillColor' : 'HeartStrokeGray'}
      content={
        <ProductDetailCard
          product={merged.product}
          price={merged.price}
          saveCount={merged.saveCount}
          link={
            link
              ? {
                  ...link,
                  onClick: () => {
                    trackShopFeedDetailMdGoSiteClick({
                      id,
                      title: merged.product.title,
                      brand: merged.product.brand,
                      categoryName,
                      discountPrice: merged.price?.discount,
                    });
                    link.onClick?.();
                  },
                }
              : undefined
          }
          linkHrefOverride={merged.linkHrefOverride}
          isLoading={isPending}
        />
      }
    />
  );
};

export default ProductDetailOverlay;
