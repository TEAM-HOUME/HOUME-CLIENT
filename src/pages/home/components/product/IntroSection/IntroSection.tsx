import { useEffect, useState } from 'react';

import bannerFallback from '@assets/images/bannerFallback.svg';

import * as styles from './IntroSection.css';

export type IntroSectionProps = {
  bannerUrl?: string | null;
  alt?: string;
};

const resolveInitialSrc = (url: string | null | undefined) =>
  url ? url : bannerFallback;

const IntroSection = ({ bannerUrl, alt = '상품 배너' }: IntroSectionProps) => {
  const initialImageSrc = resolveInitialSrc(bannerUrl);

  const [imageSrc, setImageSrc] = useState(initialImageSrc);

  const handleImageError = () => {
    setImageSrc(bannerFallback);
  };

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
        onError={handleImageError}
      />
    </section>
  );
};

export default IntroSection;
