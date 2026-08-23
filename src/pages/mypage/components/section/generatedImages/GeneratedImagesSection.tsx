import { useNavigate } from 'react-router-dom';

import { useMypageGeneratedImagesAnalytics } from '@pages/mypage/analytics/useMypageAnalytics';
import { useGeneratedImageListQuery } from '@pages/mypage/apis/queries/useGeneratedImageListQuery';
import { formatDate } from '@pages/mypage/utils/formatting';

import { ROUTES } from '@routes/paths';

import { isCurationViewType } from '@store/imageFlow/flowConfig';

import type { ItemResponse } from '@apis/__generated__/data-contracts';

import Loading from '@components/loading/Loading';

import * as styles from './GeneratedImagesSection.css';
import GenImgCard from '../../card/genImgCard/GenImgCard';
import EmptyStateSection from '../emptyState/EmptyStateSection';

/**
 * 마이페이지 생성 이미지 목록 섹션
 * - 감지 데이터 프리패치와 네비게이션 상태 구성을 함께 처리
 */
const GeneratedImagesSection = () => {
  const navigate = useNavigate();

  const {
    data: imagesListData,
    isPending,
    isError,
  } = useGeneratedImageListQuery();

  const groups = imagesListData?.groups ?? [];
  const isListReady = !isPending && !isError && !!imagesListData;

  const { trackCardGenImgClick, trackMoreGenImgClick } =
    useMypageGeneratedImagesAnalytics({
      groups,
      isListReady,
    });

  const handleViewResult = (item: ItemResponse) => {
    if (item.imageId == null || !item.generatedImageUrl || !item.viewType) {
      return;
    }
    navigate(
      `${ROUTES.GENERATE_RESULT}?houseId=${item.imageId}&viewType=${item.viewType}`,
      {
        state: {
          imageUrl: item.generatedImageUrl,
          isMirror: item.isMirror,
          from: 'mypage',
          entryGenImgId: item.imageId,
        },
      }
    );
  };

  if (isPending) {
    return <Loading />;
  }

  if (isError || !imagesListData) {
    return <EmptyStateSection type="generatedImages" />;
  }

  if (groups.length === 0) {
    return <EmptyStateSection type="generatedImages" />;
  }

  return (
    <section className={styles.wrapper}>
      {groups.map((group, index) => (
        <div key={group.date}>
          {index > 0 && <div className={styles.divider} />}
          <div className={styles.groupContainer}>
            <div className={styles.date}>
              {group.date ? formatDate(group.date) : ''}
            </div>
            <div className={styles.listContainer}>
              {(group.items ?? []).map((item) => {
                if (item.imageId == null) return null;
                const isCurationCard = isCurationViewType(item.viewType);
                return (
                  <GenImgCard
                    key={item.imageId}
                    cardType={isCurationCard ? 'curation' : 'list'}
                    productSummaryText={item.productSummaryText}
                    bannerTitle={item.bannerTitle}
                    viewType={item.viewType}
                    imageId={item.imageId}
                    imageUrl={item.generatedImageUrl}
                    isMirror={item.isMirror}
                    usedProducts={item.usedProducts}
                    onCardGenImgClick={() => {
                      trackCardGenImgClick(item);
                      handleViewResult(item);
                    }}
                    onBtnMoreGenImgClick={() => {
                      trackMoreGenImgClick(item);
                      handleViewResult(item);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default GeneratedImagesSection;
