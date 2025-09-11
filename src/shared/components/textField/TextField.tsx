import { useState } from 'react';

import * as styles from './TextField.css';

interface TextFieldProps
  extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  isError?: boolean;
  fieldSize?: 'thin' | 'small' | 'large';
  maxLength?: number;
  value?: string;
  onChange?: (value: string) => void;
}

const TextField = ({
  isError = false,
  fieldSize = 'small',
  maxLength,
  value: controlledValue,
  onChange: onControlledChange,
  id,
  ...props
}: TextFieldProps) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const isControlled = controlledValue !== undefined;
  const inputValue = isControlled ? controlledValue : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setValue(newValue);
    }
    onControlledChange?.(newValue);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const isFilled = inputValue !== '' && !isFocused; // 값 입력, focus가 아닌 경우 true

  return (
    <input
      id={id}
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={styles.textField({
        state: isError
          ? isFocused
            ? 'errorFocused'
            : 'error'
          : isFilled
            ? 'filled'
            : 'default',
        fieldSize,
      })}
      maxLength={maxLength}
      {...props}
    />
  );
};
export default TextField;
