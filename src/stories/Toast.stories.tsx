import { TOAST_TYPE } from '@/shared/types/toast';

import Toast from '../shared/components/toast/Toast';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'shared/components/toast/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text', description: '토스트 메시지 텍스트' },
    type: {
      control: { type: 'radio' },
      options: Object.values(TOAST_TYPE),
      description: '토스트 종류',
    },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'react-toastify로 구현한 토스트 컴포넌트입니다.\n' +
          'toast type(success, warning)을 설정해 상황에 적절한 토스트 컴포넌트를 렌더링합니다.',
      },
    },
  },
} satisfies Meta<typeof Toast>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    text: '작업이 성공적으로 완료되었습니다!',
    type: TOAST_TYPE.INFO,
  },
};

export const Warning: Story = {
  args: {
    text: '결제는 아직 준비 중인 기능이에요',
    type: TOAST_TYPE.WARNING,
  },
};

export const CustomMargin: Story = {
  args: {
    text: '하단 여백이 변경된 토스트 예시',
    type: TOAST_TYPE.WARNING,
  },
  parameters: {
    controls: { exclude: ['style'] },
    docs: {
      source: {
        code: `toast(
    <Toast
      text="하단 여백이 변경된 토스트 예시"
      type={TOAST_TYPE.Warning}
    />,
    {
      style: { marginBottom: '5rem', ...toastStyle },
    }
  );`,
      },
    },
  },
};
