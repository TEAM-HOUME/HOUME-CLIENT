import { generatePath, useNavigate } from 'react-router-dom';

import Banner, {
  type BannerSlide,
} from '@pages/home/components/explore/banner/Banner';

import { ROUTES } from '@routes/paths';

import imgBanner01 from '@assets/v2/images/ImgBanner_01.png';
import imgBanner02 from '@assets/v2/images/ImgBanner_02.png';
import imgBanner03 from '@assets/v2/images/ImgBanner_03.png';
import imgBanner04 from '@assets/v2/images/ImgBanner_04.png';

import * as styles from './ExploreTab.css';
import RoomTypeSection from './RoomTypeSection/RoomTypeSection';
import StyleSection from './StyleSection/StyleSection';

const BANNER_SLIDES_MOCK: BannerSlide[] = [
  { id: 1, title: '잦은 재택근무에 딱 맞는', imageUrl: imgBanner01 },
  { id: 2, title: '창가에서 브런치 즐기는', imageUrl: imgBanner02 },
  { id: 3, title: '친구 초대하기 좋은', imageUrl: imgBanner03 },
  { id: 4, title: 'OTT 감상하기 좋은', imageUrl: imgBanner04 },
];

const ExploreTab = () => {
  const navigate = useNavigate();

  const handleBannerSlideClick = (slide: BannerSlide) => {
    navigate(
      // React Router generatePath 기반 동적 라우팅 적용
      generatePath(ROUTES.BANNER_DETAIL, { bannerId: String(slide.id) })
    );
  };

  return (
    <div className={styles.container}>
      <Banner
        slides={BANNER_SLIDES_MOCK}
        onSlideClick={handleBannerSlideClick}
      />
      <div className={styles.content}>
        <RoomTypeSection />
        <StyleSection />
      </div>
    </div>
  );
};

export default ExploreTab;
