import CtaButton from '@components/button/ctaButton/CtaButton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CtaButton> = {
  title: 'Button/CtaButton',
  component: CtaButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'CTA 버튼 컴포넌트입니다. 상태 3개와 카카오 로그인 버튼을 확인할 수 있습니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CtaButton>;

export const Active: Story = {
  args: {
    children: '주요 활동 선택하기',
    isActive: true,
    typeVariant: 'default',
  },
};

export const Disabled: Story = {
  args: {
    children: '주요 활동 선택하기',
    isActive: false,
    typeVariant: 'default',
  },
};

export const KakaoLogin: Story = {
  args: {
    children: '카카오 로그인',
    isActive: true,
    typeVariant: 'kakao',
  },
};
