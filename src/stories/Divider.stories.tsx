import Divider from '@shared/components/divider/Divider';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/Divider',
  component: Divider,
  parameters: {
    docs: {
      description: {
        component:
          '구분선 역할을 하는 Divider 컴포넌트입니다. 일반적으로 콘텐츠를 시각적으로 구분할 때 사용됩니다.',
      },
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {},
};
