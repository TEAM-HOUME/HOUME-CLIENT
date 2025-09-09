import LargeFilled from '@components/button/largeFilledButton/LargeFilledButton';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof LargeFilled> = {
  title: 'Button/LargeFilled',
  component: LargeFilled,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'large filled 버튼 컴포넌트. 활성화 여부 및 에러 상태, 선택 전/후 상태를 보여줍니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LargeFilled>;

export const Active: Story = {
  args: {
    children: '버튼 이름',
    isActive: true,
  },
};

export const Disabled: Story = {
  args: {
    children: '버튼 이름',
    isActive: false,
  },
};

export const Error: Story = {
  args: {
    children: '버튼 이름',
    isError: true,
  },
};
