import { useNavigate } from 'react-router-dom';

import CardCuration from '@/pages/mypage/components/card/cardCuration/CardCuration';
import { useMyPageImages } from '@/pages/mypage/hooks/useMypage';
import { ROUTES } from '@/routes/paths.ts';
import Loading from '@/shared/components/loading/Loading';

import * as styles from './GeneratedImagesSection.css';
import EmptyStateSection from '../emptyState/EmptyStateSection';

const GeneratedImagesSection = () => {
  const navigate = useNavigate();
  const { data: imagesData, isLoading, isError } = useMyPageImages();

  const handleViewResult = (houseId: number) => {
    navigate(`${ROUTES.GENERATE_RESULT}?from=mypage&houseId=${houseId}`);
  };

  // 로딩 중
  if (isLoading) {
    return <Loading />;
  }

  // 에러 또는 데이터 없음
  if (isError || !imagesData) {
    return <EmptyStateSection type="generatedImages" />;
  }

  // 이미지가 없을 때
  if (imagesData.histories.length === 0) {
    return <EmptyStateSection type="generatedImages" />;
  }

  return (
    <section className={styles.container}>
      <div className={styles.gridContainer}>
        {imagesData.histories.map((image) => (
          <CardCuration
            key={image.imageId}
            imageUrl={image.generatedImageUrl}
            onCurationClick={() => handleViewResult(image.houseId)}
          />
        ))}
      </div>
    </section>
  );
};

export default GeneratedImagesSection;
