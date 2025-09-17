import LikeButton from '@components/button/likeButton/LikeButton';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof LikeButton> = {
  title: 'Button/LikeButton',
  component: LikeButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '좋아요 버튼 컴포넌트. 텍스트+아이콘(withText) / 아이콘-only(onlyIcon) 타입을 지원합니다.',
      },
    },
    argTypes: {
      type: {
        control: 'radio',
        options: ['withText', 'onlyIcon'],
      },
      isSelected: {
        control: 'boolean',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LikeButton>;

const GrayBg = (Story: any) => (
  <div style={{ background: '#F3F4F7', padding: 16 }}>
    <Story />
  </div>
);

// 텍스트+아이콘
export const WithText: Story = {
  args: {
    typeVariant: 'withText',
    isSelected: false,
    children: '좋아요',
  },
};

export const WithTextSelected: Story = {
  args: {
    typeVariant: 'withText',
    isSelected: true,
    children: '좋아요',
  },
};

// 아이콘-only 버튼
export const OnlyIcon: Story = {
  args: {
    typeVariant: 'onlyIcon',
    isSelected: false,
  },
  decorators: [GrayBg],
};

export const OnlyIconSelected: Story = {
  args: {
    typeVariant: 'onlyIcon',
    isSelected: true,
  },
  decorators: [GrayBg],
};
