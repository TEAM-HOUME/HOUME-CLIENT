import LikeButton from '@components/button/likeButton/LikeButton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof LikeButton> = {
  title: 'Button/LikeButton',
  component: LikeButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '좋아요 버튼 컴포넌트. 선택 전/후 상태를 보여줍니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LikeButton>;

export const Active: Story = {
  args: {
    children: '이름',
  },
};
