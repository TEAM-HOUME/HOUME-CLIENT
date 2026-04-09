import { useEffect, useState } from 'react';

import bannerFallback from '@assets/v2/images/bannerFallback.svg';

import * as styles from './IntroSection.css';

export type IntroSectionProps = {
  /** API 등에서 받은 인트로 이미지·GIF URL. 없으면 bannerFallback부터 표시 */
  bannerUrl?: string | null;
  alt?: string;
};

const resolveInitialSrc = (url: string | null | undefined) =>
  url ? url : bannerFallback;

const IntroSection = ({ bannerUrl, alt = '상품 배너' }: IntroSectionProps) => {
  const initialImageSrc = resolveInitialSrc(bannerUrl);

  // 이미지 로드 실패 시 fallback src를 유지하고,
  // 부모가 새 mediaUrl을 내려주면 그 값으로 다시 동기화 (RoomTypeCard와 동일 패턴)
  const [imageSrc, setImageSrc] = useState(initialImageSrc);

  useEffect(() => {
    setImageSrc(resolveInitialSrc(bannerUrl));
  }, [bannerUrl]);

  return (
    <section className={styles.section} aria-label={alt}>
      <img
        className={styles.introBanner}
        src={imageSrc}
        alt={alt}
        draggable={false}
        loading="eager"
        decoding="async"
        onError={() => setImageSrc(bannerFallback)}
      />
    </section>
  );
};

export default IntroSection;
