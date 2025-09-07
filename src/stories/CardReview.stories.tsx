import { CardReview } from '@shared/components/cardReview/CardReview';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CardReview> = {
  title: 'Components/CardReview',
  component: CardReview,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
    username: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CardReview>;

export const Default: Story = {
  args: {
    title: '제목',
    body: '내용내용내용',
    username: '유저이름',
  },
};
