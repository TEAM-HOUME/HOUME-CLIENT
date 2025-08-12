import * as styles from '../StepCommon.css';
import Subtitle from '../subtitle/Subtitle';
import ShowErrorMessage from '@/shared/components/button/showErrorButton/ShowErrorButton';
import LargeFilled from '@/shared/components/button/largeFilledButton/LargeFilledButton';

interface SubOption<T = string> {
  id?: number;
  code: T;
  label: string;
}

interface SubOptionGroupProps<T = string> {
  subtitle: string;
  caption?: string;
  options: SubOption<T>[]; // '오피스텔', '빌라/다세대', '아파트', '그 외' 등
  selected?: T | number; // 사용자가 선택한 옵션, code 또는 id (options.ts) 모두 지원
  onButtonClick: (value: T | number) => void;
  error?: string;
  useId?: boolean; // id 기반 사용 여부, 기본적으로 code 사용
}

// 제네릭 사용으로 onButtonClick(value)에서 value의 타입을 T로 설정
// -> OptionGroup 호출부에서 value 사용 시 타입 단언(as) 사용 방지
const SubOptionGroup = <T = string,>({
  subtitle,
  caption,
  options,
  selected,
  onButtonClick,
  error,
  useId = false,
}: SubOptionGroupProps<T>) => {
  return (
    <div className={styles.subOptionGroupWrapper}>
      <Subtitle subtitle={subtitle} caption={caption} />
      <div className={styles.buttonBox}>
        {options.map((option) => {
          const optionValue = useId ? option.id : option.code;
          const isSelected = selected === optionValue;

          return (
            <LargeFilled
              key={useId ? option.id : String(option.code)}
              isActive={true}
              isSelected={isSelected}
              onClick={() => onButtonClick(optionValue!)}
            >
              {option.label}
            </LargeFilled>
          );
        })}
      </div>
      {error && <ShowErrorMessage message={error} />}
    </div>
  );
};

export default SubOptionGroup;
