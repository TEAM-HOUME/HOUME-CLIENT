import ProgressBarLoading from '@shared/components/progressBarLoading/ProgressBarLoading';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ProgressBarLoading> = {
  title: 'Components/ProgressBarLoading',
  component: ProgressBarLoading,
  tags: ['autodocs'],
  args: {
    text: '이미지를 생성하는 중이에요 (13%)',
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBarLoading>;

export const Start: Story = {
  args: {
    variant: 'start',
  },
};

export const Loading: Story = {
  args: {
    variant: 'loading',
  },
};

export const Complete: Story = {
  args: {
    variant: 'complete',
  },
};
