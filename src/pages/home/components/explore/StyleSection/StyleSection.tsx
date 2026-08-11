import { generatePath, useNavigate } from 'react-router-dom';

import {
  trackHomeStyleCardClick,
  trackHomeStyleMoreClick,
} from '@pages/home/analytics/homeAnalytics';

import { ROUTES } from '@routes/paths';

import FallbackImage from '@assets/images/bannerFallback.svg';

import TextButton from '@components/btnText/TextButton';
import InlineError from '@components/inlineError/InlineError';
import Loading from '@components/loading/Loading';
import StyleCard from '@components/styleCard/StyleCard';

import { useGetStyleListQuery } from '@/shared/apis/queries/useGetStyleQuery';

import * as styles from './StyleSection.css';

const EXPLORE_STYLE_GRID_SIZE = 4;

const StyleSection = () => {
  const navigate = useNavigate();

  const handleStyleClick = (styleId: number, styleName?: string) => {
    trackHomeStyleCardClick({ id: styleId, name: styleName });
    navigate(
      generatePath(ROUTES.STYLE_DETAIL, { styleId: styleId.toString() })
    );
  };

  const handleMoreClick = () => {
    trackHomeStyleMoreClick();
    navigate(ROUTES.STYLE_LIST);
  };

  const {
    data: stylesData = [],
    isFetching,
    isError,
    refetch,
  } = useGetStyleListQuery(EXPLORE_STYLE_GRID_SIZE);

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2 className={styles.sectionTitle}>다른 스타일로 꾸며보기</h2>
        <TextButton
          color="secondary"
          size="s"
          rightIcon="ArrowRight"
          onClick={handleMoreClick}
        >
          더보기
        </TextButton>
      </div>

      <div className={styles.cardGrid}>
        {isFetching ? (
          <Loading />
        ) : isError ? (
          <InlineError
            onRetry={refetch}
            message="다른 스타일을 불러올 수 없습니다"
          />
        ) : (
          <>
            {stylesData.map((style) => (
              <StyleCard
                key={style.id}
                imageSrc={style.imageUrl || FallbackImage}
                title={style.name}
                onClick={() => handleStyleClick(style.id, style.name)}
                imageLoading="eager"
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default StyleSection;
