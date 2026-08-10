import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { padToTwoDigits } from '@utils/userFormValidation';

import * as styles from './DateField.css';
import TextFieldContainer from './TextFieldContainer';

interface DateValue {
  year: string;
  month: string;
  day: string;
}

interface DateError {
  year?: boolean;
  month?: boolean;
  day?: boolean;
}

interface DateFieldProps {
  value: DateValue;
  onChange: (value: DateValue) => void;
  error?: DateError;
  errorMessage?: string;
  onFocus?: () => void;
}

const onlyNumber = (value: string) => value.replace(/\D/g, '');

const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  ({ value, onChange, error, errorMessage, onFocus }, ref) => {
    const [focusedPart, setFocusedPart] = useState<
      'year' | 'month' | 'day' | null
    >(null);

    const isFocused = focusedPart !== null;
    const isError = !!(error?.year || error?.month || error?.day);

    const yearInputRef = useRef<HTMLInputElement>(null);
    const hasEmittedFocusRef = useRef(false);
    useImperativeHandle(ref, () => yearInputRef.current! as HTMLInputElement);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value: inputValue } = e.target;
      const key = name as keyof DateValue;

      const maxLength = key === 'year' ? 4 : 2;
      const sliceValue = onlyNumber(inputValue).slice(0, maxLength);

      onChange({
        ...value,
        [key]: sliceValue,
      });
    };

    const handleMonthBlur = () => {
      setFocusedPart(null);
      const paddedMonth = padToTwoDigits(value.month);
      if (paddedMonth !== value.month) {
        onChange({
          ...value,
          month: paddedMonth,
        });
      }
    };

    const handleDayBlur = () => {
      setFocusedPart(null);
      const paddedDay = padToTwoDigits(value.day);
      if (paddedDay !== value.day) {
        onChange({
          ...value,
          day: paddedDay,
        });
      }
    };

    const handleDateRowFocusIn = () => {
      if (hasEmittedFocusRef.current) return;

      hasEmittedFocusRef.current = true;
      onFocus?.();
    };

    const handleDateRowFocusOut = (e: React.FocusEvent<HTMLDivElement>) => {
      const next = e.relatedTarget;
      if (next instanceof Node && e.currentTarget.contains(next)) return;

      hasEmittedFocusRef.current = false;
    };

    return (
      <TextFieldContainer
        isFocused={isFocused}
        isError={isError}
        errorMessage={errorMessage}
      >
        <div
          className={styles.dateRow}
          onFocus={handleDateRowFocusIn}
          onBlur={handleDateRowFocusOut}
        >
          <input
            name="year"
            ref={yearInputRef}
            value={value.year}
            onChange={handleChange}
            onFocus={() => setFocusedPart('year')}
            onBlur={() => setFocusedPart(null)}
            placeholder="YYYY"
            inputMode="numeric"
            aria-label="출생 연도"
            className={styles.dateInput({
              isErrorText: !!error?.year,
            })}
          />

          <span className={styles.divider} />

          <input
            name="month"
            value={value.month}
            onChange={handleChange}
            onFocus={() => setFocusedPart('month')}
            onBlur={handleMonthBlur}
            placeholder="MM"
            inputMode="numeric"
            aria-label="출생 달"
            className={styles.dateInput({
              isErrorText: !!error?.month,
            })}
          />

          <span className={styles.divider} />

          <input
            name="day"
            value={value.day}
            onChange={handleChange}
            onFocus={() => setFocusedPart('day')}
            onBlur={handleDayBlur}
            placeholder="DD"
            inputMode="numeric"
            aria-label="출생 일"
            className={styles.dateInput({
              isErrorText: !!error?.day,
            })}
          />
        </div>
      </TextFieldContainer>
    );
  }
);

DateField.displayName = 'DateField';

export default DateField;
