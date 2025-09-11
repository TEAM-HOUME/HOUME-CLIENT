import Popup from './Popup';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/components/overlay/popup',
  component: Popup,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: '팝업 제목 텍스트' },
    detail: { control: 'text', description: '팝업 상세 텍스트' },
    onClose: { action: 'closed', description: '팝업 닫기 콜백' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'toss/overlay-kit을 사용한 팝업 컴포넌트',
      },
    },
  },
} satisfies Meta<typeof Popup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClose: () => {},
    title: '지금 나가면\n무료 토큰 1개가 사라져요!',
    detail:
      '조금만 더 입력하면 이미지를 받을 수 있어요.\n나가면 입력한 내용과 함께 토큰도 소진돼요.',
  },
};

export const Closed: Story = {
  args: {
    onClose: () => {},
    title: '팝업이 닫힌 상태',
    detail: '',
  },
};
