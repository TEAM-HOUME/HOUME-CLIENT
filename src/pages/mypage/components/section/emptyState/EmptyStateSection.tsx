import { useNavigate } from 'react-router-dom';

import SmallButton from '@/pages/mypage/components/button/smallButton/SmallButton';
import { ROUTES } from '@/routes/paths';
import emptyImage from '@/shared/assets/images/mypageEmptyImage.png';

import * as styles from './EmptyState.css';

interface EmptyStateSectionProps {
  type: 'genImg' | 'savedItem';
}

const EmptyStateSection = ({ type }: EmptyStateSectionProps) => {
  const navigate = useNavigate();

  const content = {
    genImg: {
      title: '생성된 이미지가 없어요.',
      description: '지금 바로 이미지를 만들어보세요.',
      buttonText: '이미지 만들러 가기',
      onClick: () => navigate(ROUTES.HOME), // TODO: 이미지 생성 페이지로 이동
    },
    savedItem: {
      title: '찜 가구가 없어요.',
      description:
        '지금 바로 이미지를 만들고\n내 취향에 딱 맞는 가구를 추천받아보세요.',
      buttonText: '이미지 만들러 가기',
      onClick: () => navigate(ROUTES.HOME), // TODO: 이미지 생성 페이지로 이동
    },
  };

  const { title, description, buttonText, onClick } = content[type];

  return (
    <section className={styles.container}>
      <img src={emptyImage} alt="" className={styles.image} />
      <div className={styles.contentWrapper}>
        <div className={styles.textWrapper}>
          <p className={styles.title}>{title}</p>
          <p className={styles.description}>{description}</p>
        </div>
        <SmallButton onClick={onClick}>{buttonText}</SmallButton>
      </div>
    </section>
  );
};

export default EmptyStateSection;
