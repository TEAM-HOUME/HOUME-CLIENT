import TextField from '@components/textField/TextField';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof TextField> = {
  title: 'Input/TextField',
  component: TextField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '텍스트 입력 필드 컴포넌트입니다. 에러 상태, 사이즈, 최대 글자수 등의 속성을 확인할 수 있습니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    placeholder: 'YYYY',
  },
};

export const Filled: Story = {
  args: {
    placeholder: '값을 입력한 상태',
    value: '입력됨',
  },
};

export const Error: Story = {
  args: {
    placeholder: '에러 상태',
    isError: true,
  },
};

export const ThinSize: Story = {
  args: {
    placeholder: 'ex) 솝트특별자치시 앱잼구',
    fieldSize: 'thin',
  },
};

export const LargeSize: Story = {
  args: {
    placeholder: '이름을 입력해주세요.',
    fieldSize: 'large',
  },
};
