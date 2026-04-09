import { useNavigate } from 'react-router-dom';

import { logMyPageClickBtnMakeImg } from '@pages/mypage/utils/analytics';

import { ROUTES } from '@routes/paths';

import emptyImage from '@assets/v2/images/ImgEmpty.png';

import TextButton from '@/shared/components/v2/btnText/TextButton';
import ActionButton from '@/shared/components/v2/button/actionButton/ActionButton';

import * as styles from './EmptyStateSection.css';

interface EmptyStateSectionProps {
  type: 'generatedImages' | 'savedItems';
}

const EmptyStateSection = ({ type }: EmptyStateSectionProps) => {
  const navigate = useNavigate();

  const handleGoProductClick = () => {
    logMyPageClickBtnMakeImg();
    navigate(ROUTES.HOME, { state: { activeTab: 'product' } });
  };

  const handleGoRoomTypeClick = () => {
    navigate(ROUTES.GENERATE); // 임시 라우터
  };

  const content = {
    generatedImages: {
      title: '아직 만들어진 이미지가 없어요.',
      description: '집 구조와 취향을 반영한 우리 집을\n지금 바로 상상해보세요.',
      buttonText: '우리 집 상상해보기',
      lineBtnText: '상품 먼저 둘러보기',
      onPrimaryClick: handleGoRoomTypeClick,
      onSecondaryClick: handleGoProductClick,
    },
    savedItems: {
      title: '아직 찜한 상품이 없어요.',
      description:
        '마음에 드는 상품을 찜해두고\n우리 집에 두면 어떨지 상상해보세요.',
      buttonText: '상품 둘러보기',
      lineBtnText: '우리 집 먼저 상상하기',
      onPrimaryClick: handleGoProductClick,
      onSecondaryClick: handleGoRoomTypeClick,
    },
  };

  const {
    title,
    description,
    buttonText,
    lineBtnText,
    onPrimaryClick,
    onSecondaryClick,
  } = content[type];

  return (
    <section className={styles.container}>
      <img src={emptyImage} alt="" className={styles.image} />
      <div className={styles.contentWrapper}>
        <div className={styles.textWrapper}>
          <p className={styles.title}>{title}</p>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.buttonWrapper}>
          <ActionButton
            variant="solid"
            color="primary"
            size="L"
            onClick={onPrimaryClick}
          >
            {buttonText}
          </ActionButton>
          {/* 컴포넌트 변경 가능성 있음 */}
          <TextButton
            color="secondary"
            size="s"
            onClick={(e) => {
              e.stopPropagation();
              onSecondaryClick?.();
            }}
            className={styles.lineButton}
          >
            {lineBtnText}
          </TextButton>
        </div>
      </div>
    </section>
  );
};

export default EmptyStateSection;
