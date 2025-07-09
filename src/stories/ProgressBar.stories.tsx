import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBarLoading } from '@/shared/components/progressBarLoading/ProgressBarLoading';

const meta: Meta<typeof ProgressBarLoading> = {
  title: 'Components/ProgressbarLoading',
  component: ProgressBarLoading,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProgressBarLoading>;

export const Default: Story = {};
