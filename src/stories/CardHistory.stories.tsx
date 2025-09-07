import CardHistory from '@/shared/components/card/cardHistory/CardHistory';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CardHistory> = {
  title: 'Components/CardHistory',
  component: CardHistory,
  argTypes: {
    src: {
      control: 'text',
      defaultValue: '/images/example.png',
    },
    title: {
      control: 'text',
      defaultValue: '우드 인테리어의 8평 오피스텔',
    },
    btnText: {
      control: 'text',
      defaultValue: '가구 추천 보러가기',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CardHistory>;

export const Default: Story = {
  args: {
    src: '/images/example.png',
    title: '우드 인테리어의 8평 오피스텔',
    btnText: '가구 추천 보러가기',
  },
};
