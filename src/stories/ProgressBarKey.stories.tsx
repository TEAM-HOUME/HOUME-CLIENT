import ProgressBarKey from '@/shared/components/progressBarKey/ProgressBarKey';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ProgressBarKey> = {
  title: '공통/ProgressBarKey',
  component: ProgressBarKey,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '4단계 진행 상황을 시각적으로 표시하는 ProgressBarKey 컴포넌트입니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Step1: Story = {
  args: { currentStep: 1 },
};

export const Step2: Story = {
  args: { currentStep: 2 },
};

export const Step3: Story = {
  args: { currentStep: 3 },
};

export const Step4: Story = {
  args: { currentStep: 4 },
};
