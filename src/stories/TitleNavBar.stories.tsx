import { MemoryRouter } from 'react-router';
import type { Meta, StoryObj } from '@storybook/react-vite';
import TitleNavBar from '@/shared/components/navBar/TitleNavBar';

const meta: Meta<typeof TitleNavBar> = {
  title: 'navbar/TitleNavBar',
  component: TitleNavBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TitleNavBar>;

export const Default: Story = {
  args: {
    title: '마이 페이지',
    isBackIcon: true,
    isLoginBtn: true,
  },
};

export const NoBackButton: Story = {
  args: {
    title: '회원가입',
    isBackIcon: false,
    isLoginBtn: true,
  },
};

export const NoLoginButton: Story = {
  args: {
    title: '설정',
    isBackIcon: true,
    isLoginBtn: false,
  },
};

export const TitleOnly: Story = {
  args: {
    title: '공지사항',
    isBackIcon: false,
    isLoginBtn: false,
  },
};
