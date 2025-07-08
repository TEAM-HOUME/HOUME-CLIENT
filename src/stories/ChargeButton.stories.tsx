import type { Meta, StoryObj } from '@storybook/react-vite';
import ChargeButton from '@/shared/components/button/chargeButton/chargeBtn';

const meta: Meta<typeof ChargeButton> = {
  title: 'Button/ChargeButton',
  component: ChargeButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '충전 버튼 컴포넌트. 활성/비활성 상태를 보여줍니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChargeButton>;

export const Active: Story = {
  args: {
    children: '충전하기',
    isActive: true,
  },
};

export const Disabled: Story = {
  args: {
    children: '충전하기',
    isActive: false,
  },
};
