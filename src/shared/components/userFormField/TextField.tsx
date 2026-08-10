import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import IconButton from '@components/button/IconButton';

import * as styles from './TextField.css';
import TextFieldContainer from './TextFieldContainer';

interface TextFieldProps
  extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  isError?: boolean;
  errorMessage?: string;
  maxLength?: number;
  onRefresh?: () => void;
  onEnter?: () => void;
  onClear?: () => void;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      value: controlledValue,
      onChange,
      isError = false,
      errorMessage,
      maxLength,
      onRefresh,
      onEnter,
      onClear,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current! as HTMLInputElement);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value;
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('');
      }
      onChange?.('');
      onClear?.();
      inputRef.current?.focus(); // clear 클릭 시 포커스 복구
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onEnter?.();
      }
    };

    return (
      <div className={styles.wrapper}>
        <TextFieldContainer
          isFocused={isFocused}
          isError={isError}
          errorMessage={errorMessage}
        >
          <input
            {...props}
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            aria-label="닉네임"
            className={styles.input({
              isErrorText: isError,
            })}
          />

          {value ? (
            <IconButton name="CloseFillGray" size="S" onClick={handleClear} />
          ) : null}
        </TextFieldContainer>
        <div className={styles.refreshBtnContainer}>
          <IconButton
            name="Refresh"
            aria-label="랜덤 닉네임 재생성"
            onClick={(e) => {
              e.preventDefault();
              onRefresh?.();
            }}
          />
        </div>
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;
