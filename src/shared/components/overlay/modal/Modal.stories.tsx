import Modal from './Modal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/components/overlay/Modal',
  component: Modal,
  argTypes: {
    title: { control: 'text' },
    onClose: { action: 'onClose' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'toss/overlay-kit을 사용해 구현한 모달창입니다.\n' +
          '나가기 버튼을 탭할 시 모달창이 unmount됩니다.',
      },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '스타일링 이미지대로 가구를 추천 받으려면 크레딧이 필요해요',
    onClose: () => {},
  },
};

export const Interactive: Story = {
  args: {
    title: 'Interactive Modal',
    onClose: () => {},
  },
  parameters: {
    actions: { handles: ['click button'] },
  },
};
