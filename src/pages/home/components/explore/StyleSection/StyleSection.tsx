import { generatePath, useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import StyleCard from '@components/v2/styleCard/StyleCard';

import TextButton from '@/shared/components/v2/btnText/TextButton';

import * as styles from './StyleSection.css';

const STYLE_MOCK = [
  {
    id: 'minimal',
    imageSrc: ' ',
    title: '미니멀한 개발자의 집',
  },
  {
    id: 'kitsch',
    imageSrc: ' ',
    title: '키치한 무드의 집',
  },
  {
    id: 'animal',
    imageSrc: ' ',
    title: '반려동물과 함께 하는 집',
  },
  {
    id: 'blue',
    imageSrc: ' ',
    title: '블루 아이템이 포인트인 집',
  },
] as const;

const StyleSection = () => {
  const navigate = useNavigate();

  const handleStyleClick = (styleId: string) => {
    navigate(generatePath(ROUTES.STYLE_DETAIL, { styleId }));
  };

  const handleMoreClick = () => {
    navigate(ROUTES.STYLE_LIST);
  };

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2 className={styles.sectionTitle}>다른 스타일로 꾸며보기</h2>
        <TextButton
          color="secondary"
          size="m"
          rightIcon="ArrowRight"
          onClick={handleMoreClick}
        >
          더보기
        </TextButton>
      </div>
      <div className={styles.cardGrid}>
        {STYLE_MOCK.map((style) => (
          <StyleCard
            key={style.id}
            imageSrc={style.imageSrc}
            title={style.title}
            onClick={() => handleStyleClick(style.id)}
            imageLoading="eager"
          />
        ))}
      </div>
    </section>
  );
};

export default StyleSection;
