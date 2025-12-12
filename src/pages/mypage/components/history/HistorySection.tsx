import { useNavigate } from 'react-router-dom';

import emptyImage from '@/shared/assets/images/emptyImage.png';
import CardHistory from '@/shared/components/card/cardHistory/CardHistory';
import Loading from '@/shared/components/loading/Loading';

import * as styles from './HistorySection.css';
import { useMyPageImagesQuery } from '../../hooks/useMypage';

/**
 * 마이페이지 결과 히스토리 섹션
 * - 이미지 생성 이력을 불러와 카드 형태로 노출
 */
const HistorySection = () => {
  const navigate = useNavigate();
  const { data: imagesData, isLoading, isError } = useMyPageImagesQuery();

  // 생성 결과 상세로 이동
  const handleViewResult = (houseId: number) => {
    navigate(`/generate/result?from=mypage&houseId=${houseId}`);
  };

  // 이미지 생성 플로우로 이동
  const handleCreateImage = () => {
    navigate('/imageSetup');
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <>
        <section className={styles.container}>
          <p className={styles.title}>이미지 생성 히스토리</p>
        </section>
        <Loading />
      </>
    );
  }

  // 에러 또는 데이터 없음
  if (isError || !imagesData) {
    return (
      <section className={styles.container}>
        <p className={styles.title}>이미지 생성 히스토리</p>
        <CardHistory
          src={emptyImage}
          title="히스토리를 불러올 수 없어요"
          btnText="다시 시도하기"
        />
      </section>
    );
  }

  const hasImages = imagesData.histories && imagesData.histories.length > 0;

  return (
    <section className={styles.container}>
      <p className={styles.title}>이미지 생성 히스토리</p>

      {hasImages ? (
        imagesData.histories.map((history) => (
          <CardHistory
            key={history.houseId}
            src={history.generatedImageUrl}
            title={`${history.tasteTag}의 ${history.equilibrium} ${history.houseForm}`}
            btnText="가구 추천 보러가기"
            onClick={() => handleViewResult(history.houseId)}
          />
        ))
      ) : (
        <CardHistory
          src={emptyImage}
          title="생성한 이미지가 없어요"
          btnText="이미지 생성하러 가기"
          onClick={handleCreateImage}
        />
      )}
    </section>
  );
};

export default HistorySection;
