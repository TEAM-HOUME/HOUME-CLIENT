import { useLayoutEffect, useRef, useState } from 'react';

import IconButton from '@components/button/IconButton';

import * as styles from './LinkInput.css';

interface LinkInputProps
  extends Omit<
    React.ComponentProps<'textarea'>,
    'value' | 'defaultValue' | 'onChange' | 'onSubmit'
  > {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
}

const LinkInput = ({
  value: controlledValue,
  placeholder = '상품 링크를 붙여넣어주세요',
  onChange: onControlledChange,
  onSubmit,
  ...props
}: LinkInputProps) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isControlled = controlledValue !== undefined;
  const inputValue = isControlled ? controlledValue : value;
  const hasValue = inputValue.trim() !== '';

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.minHeight = '0';
    el.style.height = '0';
    const nextHeight = el.scrollHeight;
    el.style.minHeight = '';
    el.style.height = `${nextHeight}px`;
  };

  useLayoutEffect(() => {
    resize();
  }, [inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    if (!isControlled) {
      setValue(nextValue);
    }
    onControlledChange?.(nextValue);
  };

  const handleSubmit = () => {
    if (!hasValue) return;
    onSubmit?.(inputValue);
  };

  return (
    <div className={styles.wrapper}>
      <textarea
        ref={textareaRef}
        className={styles.field}
        value={inputValue}
        placeholder={placeholder}
        rows={1}
        onChange={handleChange}
        {...props}
      />
      <div className={styles.buttonArea}>
        <IconButton
          name={hasValue ? 'ArrowUpFillBlack' : 'ArrowUpFillGray'}
          size="XL"
          className={styles.submit}
          disabled={!hasValue}
          onClick={handleSubmit}
          aria-label="전송"
        />
      </div>
    </div>
  );
};

export default LinkInput;
