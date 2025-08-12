import * as styles from '../StepCommon.css';
import Subtitle from '../subtitle/Subtitle';
import ShowErrorMessage from '@/shared/components/button/showErrorButton/ShowErrorButton';
import LargeFilled from '@/shared/components/button/largeFilledButton/LargeFilledButton';
import Caption from '@/shared/components/text/Caption';

interface MultiSubOption<T = string> {
  id?: number;
  code: T;
  label: string;
}

interface MultiOptionGroupProps<T = string> {
  options: MultiSubOption<T>[];
  selected?: (T | number)[];
  onButtonClick: (value: (T | number)[]) => void;
  selectedCount?: number;
  maxSelect?: number;
  isAlertPresented?: boolean;
  error?: string;
  isRequiredFurniture?: (furniture: T | number) => boolean;
  currentActivityLabel?: string;
  requiredFurnitureLabels?: string[];
  useId?: boolean;
}

const MultiOptionGroup = <T = string,>({
  options,
  selected = [],
  onButtonClick,
  selectedCount = 0,
  maxSelect,
  isAlertPresented = false,
  error,
  isRequiredFurniture,
  currentActivityLabel,
  requiredFurnitureLabels = [],
  useId = false,
}: MultiOptionGroupProps<T>) => {
  const handleClick = (optionCode: T | number) => {
    // 필수 가구인 경우 클릭 무시
    if (isRequiredFurniture?.(optionCode)) {
      return;
    }

    const isAlreadySelected = selected?.includes(optionCode) ?? false;
    let newSelected: (T | number)[];

    if (isAlreadySelected) {
      newSelected = selected.filter((item) => item !== optionCode); // 선택 해제
    } else {
      newSelected = [...selected, optionCode];
      // maxSelect 도달 시 버튼 disable -> 선택이 아예 불가 -> maxSelect 체크 로직 필요 X
    }

    onButtonClick(newSelected);
  };

  // maxSelect에 도달했는지 확인
  const hasReachedMax = maxSelect ? selected.length >= maxSelect : false;

  return (
    <div className={styles.subOptionGroupWrapper}>
      <Subtitle
        subtitle="주요 가구"
        count={selectedCount}
        maxCount={maxSelect}
      />

      {isAlertPresented &&
        currentActivityLabel &&
        requiredFurnitureLabels.length > 0 && (
          <Caption
            code={currentActivityLabel}
            option={requiredFurnitureLabels.join(', ')}
          />
        )}

      <div className={styles.buttonBox}>
        {options.map((option) => {
          // TODO: option.id와 option.code는 현재 types/funnel/options에 명시된 local값
          // 따라서 optionValue에 ! 를 사용해도 문제는 X
          const optionValue = useId ? option.id : option.code;
          const isRequired = isRequiredFurniture
            ? isRequiredFurniture(optionValue!)
            : false;
          const isSelected = selected.includes(optionValue!);

          const isActive = isRequired ? false : isSelected || !hasReachedMax;

          return (
            <LargeFilled
              key={useId ? option.id : String(option.code)}
              isActive={isActive}
              isSelected={isRequired ? false : isSelected}
              onClick={() => handleClick(optionValue!)}
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

export default MultiOptionGroup;
