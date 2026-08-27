// 원 계산
export const formatKrw = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value.toLocaleString('ko-KR');
};

// 컬러칩
export const getColorChips = (colorHexes?: string[]) => {
  const visibleColors = Array.isArray(colorHexes)
    ? colorHexes.filter(Boolean).slice(0, 3)
    : [];
  const extraColorCount =
    Array.isArray(colorHexes) && colorHexes.length > 3
      ? colorHexes.length - 3
      : 0;
  return { visibleColors: visibleColors, extraColorCount: extraColorCount };
};

// 가격 텍스트
export const getPriceTexts = (
  originalPrice?: number,
  discountPrice?: number,
  discountRate?: number
) => {
  return {
    originalPriceText: formatKrw(originalPrice),
    discountPriceText: formatKrw(discountPrice),
    discountRateText:
      typeof discountRate === 'number' &&
      Number.isFinite(discountRate) &&
      discountRate > 0
        ? `${discountRate}%`
        : null,
  };
};

// 카드 클릭 핸들러
export type CardClickArea = 'card' | 'image' | 'title';

/** 카드 내부 버튼 클릭이 wrapper로 전파되지 않도록 */
export const stopCardClickPropagation = {
  onClick: (event: React.MouseEvent) => {
    event.stopPropagation();
  },
  onKeyDown: (event: React.KeyboardEvent) => {
    event.stopPropagation();
  },
  role: 'presentation' as const,
};

export const createCardClickHandler = ({
  onCardClick,
  enableWholeCardLink,
  linkHref,
  onNavigate,
  onShoppingViewDetailClick,
}: {
  onCardClick?: (area?: CardClickArea) => void;
  enableWholeCardLink: boolean;
  linkHref?: string;
  // 카드 본문(이미지/제목) 클릭 시 실제 이동 동작. 로그인 게이트 + 새 탭 열기는 호출부(useProductLink)가 담당
  onNavigate?: () => void;
  /** shopping 카드: 카드 클릭 시 자세히 보기 (선택 버튼 등은 stopCardClickPropagation으로 제외) */
  onShoppingViewDetailClick?: () => void;
}) => ({
  handleWrapperClick: (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    // closest는 기본이 Element라 dataset이 없다. HTMLElement로 받아야 dataset을 읽는다
    const areaElement = target?.closest?.<HTMLElement>('[data-click-area]');
    const area = areaElement?.dataset?.['clickArea'] as
      | CardClickArea
      | undefined;
    const resolvedArea: CardClickArea =
      area === 'image' || area === 'title' ? area : 'card';

    onCardClick?.(resolvedArea);

    if (onShoppingViewDetailClick) {
      onShoppingViewDetailClick();
      return;
    }

    if (!enableWholeCardLink || !linkHref) return;
    onNavigate?.();
  },

  handleWrapperKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    if (onShoppingViewDetailClick) {
      event.preventDefault();
      onShoppingViewDetailClick();
      return;
    }

    if (!enableWholeCardLink || !linkHref) return;

    event.preventDefault();
    onCardClick?.('card');
    onNavigate?.();
  },
});
