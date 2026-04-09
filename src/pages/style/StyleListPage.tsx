import { generatePath, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/routes/paths';
import TitleNavBar from '@/shared/components/v2/navBar/TitleNavBar';
import StyleCard from '@/shared/components/v2/styleCard/StyleCard';

import { STYLELIST_MOCK } from './mocks/styleDetail';
import * as styles from './StyleListPage.css';

const StyleListPage = () => {
  const navigate = useNavigate();
  const handleStyleClick = (styleId: number) => {
    navigate(generatePath(ROUTES.STYLE_DETAIL, { styleId: String(styleId) }));
  };

  return (
    <section className={styles.wrapper}>
      <TitleNavBar
        title="스타일 전체 보기"
        backLabel="이전"
        onBackClick={() => navigate(-1)}
      />
      <div className={styles.cardList}>
        {STYLELIST_MOCK.data.otherStyles.map((style) => (
          <StyleCard
            size="L"
            key={style.id}
            imageSrc={style.imageUrl}
            title={style.name}
            onClick={() => handleStyleClick(style.id)}
            imageLoading="eager"
          />
        ))}
      </div>
    </section>
  );
};

export default StyleListPage;
