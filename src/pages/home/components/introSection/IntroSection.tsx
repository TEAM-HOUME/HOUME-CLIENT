import { useState, type ChangeEvent } from 'react';
import * as styles from './IntroSection.css';
import {
  INTERIOR_IMAGES,
  INTERIOR_OPTIONS,
  type InteriorOption,
} from '../../types/options';
import SmallFilledButton from '@/shared/components/button/smallFilledButton/SmallFilledButton';

const IntroSection = () => {
  const [selected, setSelected] = useState<InteriorOption>('휴식형');

  const handleOptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.value as InteriorOption);
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.titleWrapper}>
        <h2 className={styles.title}>
          나답게 꾸미고 살고 싶은
          <br />
          1인 가구를 위한 인테리어 솔루션
        </h2>
        <p className={styles.description}>
          하우미는 집 구조, 인테리어 취향, 주요 활동까지
          <br />
          AI 기반 이미지로 나만의 공간 스타일링을 제안해드려요.
        </p>
      </div>
      <div className={styles.radioImageBox}>
        <img
          src={INTERIOR_IMAGES[selected]}
          alt={selected}
          className={styles.radioImage}
          style={{
            transition: 'all 0.3s ease-out',
          }}
        />
      </div>
      <div
        className={styles.buttonGroup}
        role="radiogroup"
        aria-label="옵션선택"
      >
        {INTERIOR_OPTIONS.map((label) => (
          <label key={label} className={styles.radioButtonLabel}>
            <input
              type="radio"
              name="interiorOption"
              value={label}
              checked={selected === label}
              onChange={handleOptionChange}
              className={styles.radioButton}
            />
            <SmallFilledButton isSelected={selected === label}>
              {label}
            </SmallFilledButton>
          </label>
        ))}
      </div>
    </section>
  );
};

export default IntroSection;
