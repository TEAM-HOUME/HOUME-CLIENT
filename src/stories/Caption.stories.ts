import Caption from '@/pages/imageSetup/components/caption/Caption';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/Text/Caption',
  component: Caption,
  tags: ['autodocs'],
} satisfies Meta<typeof Caption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    code: '휴식형',
    option: '소파',
  },
};
