import type { Ref } from 'react';

import type { FilterCategory, FloorPlanFilters } from '@shared/types/floorPlan';

import type { ExploreHouseTemplateItemResponse } from '@apis/__generated__/data-contracts';

import emptyImage from '@assets/images/ImgEmpty.png';

import IconButton from '@components/button/IconButton';
import Chip from '@components/chip/Chip';
import Icon from '@components/icon/Icon';
import RoomTypeCard from '@components/roomTypeCard/RoomTypeCard';

import * as styles from './FloorPlanSelectGrid.css';

import type { FloorPlanAspectRatio } from '../../stores/useFloorPlanRatioStore';

interface FloorPlanSelectGridProps {
  gridScrollRef: Ref<HTMLDivElement | null>;
  filterCategories: FilterCategory[];
  floorPlans: ExploreHouseTemplateItemResponse[];
  isExact: boolean;
  appliedFilters: FloorPlanFilters;
  aspectRatio: FloorPlanAspectRatio;
  onCardClick: (floorPlanId: number, fromRecommendation?: boolean) => void;
  onFilterChipClick: () => void;
  onFilterChipClear: (key: keyof FloorPlanFilters) => void;
  onAspectRatioChange: (ratio: FloorPlanAspectRatio) => void;
}

const getChipLabel = (category: FilterCategory, filterValues: string[]) => {
  if (filterValues.length === 0) return category.label;

  const selectedOptions = filterValues
    .map((filterValue) => category.options.find((o) => o.id === filterValue))
    .filter(
      (option): option is NonNullable<typeof option> => option !== undefined
    );

  if (selectedOptions.length === 0) return category.label;
  if (selectedOptions.length === 1) return selectedOptions[0].label;

  return `${selectedOptions[0].label} 외 ${selectedOptions.length - 1}개`;
};

const FloorPlanSelectGrid = ({
  gridScrollRef,
  filterCategories,
  floorPlans,
  isExact,
  appliedFilters,
  aspectRatio,
  onCardClick,
  onFilterChipClick,
  onFilterChipClear,
  onAspectRatioChange,
}: FloorPlanSelectGridProps) => {
  // 도면 카드 매핑: 정상 그리드와 '이런 공간은 어떠세요?' 유사 섹션 양쪽에서 동일하게 재사용
  const renderCard = (
    plan: ExploreHouseTemplateItemResponse,
    fromRecommendation = false
  ) => {
    if (plan.id === undefined) return null;
    return (
      <RoomTypeCard
        key={plan.id}
        type="default"
        size="m"
        ratio={aspectRatio}
        label={plan.name ?? ''}
        imageSrc={plan.imageUrl ?? ''}
        showRecentBadge={plan.isLatest}
        onClick={() => onCardClick(plan.id as number, fromRecommendation)}
      />
    );
  };

  return (
    <div className={styles.container}>
      {/* 필터칩 영역 */}
      <div className={styles.chipBar}>
        {filterCategories.map((category) => {
          const filterValues = appliedFilters[category.id];
          const isFiltered = filterValues.length > 0;

          return (
            <Chip
              key={category.id}
              selected={isFiltered}
              suffixIcon={
                isFiltered ? (
                  <Icon name="Close" size="12" />
                ) : (
                  <Icon name="ChevronDown" size="12" />
                )
              }
              suffixAriaLabel={
                isFiltered ? `${category.label} 필터 초기화` : undefined
              }
              onClick={onFilterChipClick}
              onSuffixClick={
                isFiltered ? () => onFilterChipClear(category.id) : undefined
              }
            >
              {getChipLabel(category, filterValues)}
            </Chip>
          );
        })}
      </div>

      {/* 개수 + 비율 토글 (listControl) */}
      <div className={styles.listControl}>
        {/* 정확 매칭 없음(isExact=false)이면 유사 도면 개수 대신 0개로 표시 */}
        <p className={styles.countText}>{isExact ? floorPlans.length : 0}개</p>
        <div className={styles.ratioToggle}>
          <IconButton
            name={
              aspectRatio === '1:1' ? 'Grid2ColSelected' : 'Grid2ColDefault'
            }
            aria-label="2열로 보기"
            aria-pressed={aspectRatio === '1:1'}
            onClick={() => onAspectRatioChange('1:1')}
          />
          <span className={styles.toggleDivider} aria-hidden="true" />
          <IconButton
            name={
              aspectRatio === '3:2' ? 'Grid1ColSelected' : 'Grid1ColDefault'
            }
            aria-label="1열로 보기"
            aria-pressed={aspectRatio === '3:2'}
            onClick={() => onAspectRatioChange('3:2')}
          />
        </div>
      </div>

      {/* 카드 그리드 영역 */}
      <div ref={gridScrollRef} className={styles.gridScroll}>
        {isExact ? (
          <div className={styles.grid({ ratio: aspectRatio })}>
            {floorPlans.map((plan) => renderCard(plan))}
          </div>
        ) : (
          <>
            {/* 상단 이미지 + 공간없음 텍스트 */}
            <img src={emptyImage} alt="필터 결과 없음" />
            <div className={styles.emptyContainer}>
              <p className={styles.emptyTitle}>
                선택한 필터에 맞는 공간이 없어요.
              </p>
              <p className={styles.emptyDescription}>
                {
                  '하우미는 순차적으로 공간 유형을 확장하고 있어요.\n비슷한 공간을 선택해 이미지를 생성해보세요!'
                }
              </p>
            </div>

            {/* Divider */}
            <div className={styles.divider}></div>

            {/* '이런 공간은 어떠세요?' — 서버가 대체로 보내준 유사 도면 그리드 */}
            <div className={styles.similarSection}>
              <p className={styles.similarTitle}>이런 공간은 어떠세요?</p>
              <div className={styles.grid({ ratio: aspectRatio })}>
                {floorPlans.map((plan) => renderCard(plan, true))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FloorPlanSelectGrid;
