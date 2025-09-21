import clsx from 'clsx';

import ErrorMessage from '@/shared/components/button/ErrorButton/ErrorMessage';
import LargeFilled from '@/shared/components/button/largeFilledButton/LargeFilledButton';

import MainTitle from '../headingText/Maintitle';
import * as styles from '../StepCommon.css';

interface Option<T = string> {
  code: T;
  label: string;
}

interface OptionGroupProps<T = string> {
  title: string; // '주거 형태', '구조', '평형' 등
  body?: string;
  subtitle?: string;
  caption?: string;
  options: Option<T>[]; // '오피스텔', '빌라/다세대', '아파트', '그 외' 등
  selected?: T; // 사용자가 선택한 옵션
  onButtonClick: (value: T) => void;
  error?: string;
}

// 제네릭 사용으로 onButtonClick(value)에서 value의 타입을 T로 설정
// -> OptionGroup 호출부에서 value 사용 시 타입 단언(as) 사용 방지
const OptionGroup = <T = string,>({
  title,
  body,
  options,
  selected,
  onButtonClick,
  error,
}: OptionGroupProps<T>) => {
  return (
    <div className={styles.optionGroupWrapper}>
      <MainTitle title={title} body={body} />
      <div className={clsx(styles.buttonBox, styles.margin)}>
        {options.map((option) => (
          <LargeFilled
            key={String(option.code)}
            isActive={true}
            isSelected={selected === option.code}
            isError={selected === option.code && !!error}
            onClick={() => onButtonClick(option.code)}
          >
            {option.label}
          </LargeFilled>
        ))}
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default OptionGroup;
