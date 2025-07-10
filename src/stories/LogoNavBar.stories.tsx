import { MemoryRouter } from 'react-router-dom';
import LogoNavBar from '@shared/components/navBar/LogoNavBar';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof LogoNavBar> = {
  title: 'navbar/LogoNavBar',
  component: LogoNavBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '로고와 로그인/프로필 버튼이 함께 있는 내비게이션 바 컴포넌트입니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LogoNavBar>;

export const Default: Story = {
  args: {
    buttonType: null,
  },
};

export const WithLoginButton: Story = {
  args: {
    buttonType: 'login',
  },
};

export const WithProfileButton: Story = {
  args: {
    buttonType: 'profile',
  },
};
