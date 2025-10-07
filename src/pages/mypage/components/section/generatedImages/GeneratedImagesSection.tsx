//import { useMyPageImages } from '@/pages/mypage/hooks/useMypage';

import CardCuration from '@/pages/mypage/components/card/cardCuration/CardCuration';

import * as styles from './GeneratedImagesSection.css';
import EmptyStateSection from '../emptyState/EmptyStateSection';

const GeneratedImagesSection = () => {
  // TODO: API 연동 시 useMyPageImages 훅 사용
  // const { data: imagesData, isLoading } = useMyPageImages();

  // 임시 데이터
  const imagesData = {
    histories: [
      {
        imageId: 1,
        generatedImageUrl: '',
        tasteTag: '',
        equilibrium: '',
        houseForm: '',
      },
      {
        imageId: 2,
        generatedImageUrl: '',
        tasteTag: '',
        equilibrium: '',
        houseForm: '',
      },
      {
        imageId: 3,
        generatedImageUrl: '',
        tasteTag: '',
        equilibrium: '',
        houseForm: '',
      },
      {
        imageId: 4,
        generatedImageUrl: '',
        tasteTag: '',
        equilibrium: '',
        houseForm: '',
      },
      {
        imageId: 5,
        generatedImageUrl: '',
        tasteTag: '',
        equilibrium: '',
        houseForm: '',
      },
      {
        imageId: 6,
        generatedImageUrl: '',
        tasteTag: '',
        equilibrium: '',
        houseForm: '',
      },
    ],
  };

  const isLoading = false;

  // 로딩 중
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 이미지가 없을 때
  if (!imagesData || imagesData.histories.length === 0) {
    return <EmptyStateSection type="genImg" />;
  }

  return (
    <section className={styles.container}>
      <div className={styles.gridContainer}>
        {imagesData.histories.map((image) => (
          <CardCuration
            key={image.imageId}
            imageUrl={image.generatedImageUrl}
            onCurationClick={() => console.log('큐레이션 보기', image.imageId)}
          />
        ))}
      </div>
    </section>
  );
};

export default GeneratedImagesSection;
