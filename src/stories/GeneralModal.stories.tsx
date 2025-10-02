import GeneralModal from '@/shared/components/overlay/modal/GeneralModal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof GeneralModal> = {
  title: 'Modal/GeneralModal',
  component: GeneralModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '범용 모달 컴포넌트입니다. 제목, 내용, 버튼 텍스트와 스타일을 자유롭게 설정할 수 있습니다.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: '모달 제목',
    },
    content: {
      control: 'text',
      description: '모달 내용',
    },
    cancelText: {
      control: 'text',
      description: '취소 버튼 텍스트',
    },
    confirmText: {
      control: 'text',
      description: '확인 버튼 텍스트',
    },
    cancelVariant: {
      control: { type: 'radio' },
      options: ['default', 'primary'],
      description: '취소 버튼 스타일',
    },
    confirmVariant: {
      control: { type: 'radio' },
      options: ['default', 'primary'],
      description: '확인 버튼 스타일',
    },
    showCreditChip: {
      control: 'boolean',
      description: '크레딧 칩 표시 여부',
    },
    creditCount: {
      control: 'number',
      description: '현재 크레딧 수',
    },
    maxCredit: {
      control: 'number',
      description: '최대 크레딧 수',
    },
    onCancel: { action: 'cancelled' },
    onConfirm: { action: 'confirmed' },
    onClose: { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<typeof GeneralModal>;

export const Default: Story = {
  args: {
    title: '확인이 필요합니다',
    content: '정말로 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
    cancelText: '취소',
    confirmText: '삭제',
    cancelVariant: 'default',
    confirmVariant: 'primary',
    showCreditChip: false,
  },
};

export const WithCreditChip: Story = {
  args: {
    title: '더 다양한 이미지가 궁금하신가요?',
    content:
      '새로운 취향과 정보를 반영해 다시 생성해보세요!\n이미지를 생성할 때마다 크레딧이 1개 소진돼요.',
    cancelText: '돌아가기',
    confirmText: '이미지 새로 만들기',
    cancelVariant: 'default',
    confirmVariant: 'primary',
    showCreditChip: true,
    creditCount: 4,
    maxCredit: 5,
  },
};

export const BothPrimary: Story = {
  args: {
    title: '중요한 선택',
    content: '두 옵션 모두 중요한 기능입니다.\n원하는 옵션을 선택해주세요.',
    cancelText: '옵션 A',
    confirmText: '옵션 B',
    cancelVariant: 'primary',
    confirmVariant: 'primary',
    showCreditChip: false,
  },
};

export const BothDefault: Story = {
  args: {
    title: '일반 알림',
    content:
      '작업이 완료되었습니다.\n결과를 확인하거나 계속 진행할 수 있습니다.',
    cancelText: '결과 보기',
    confirmText: '계속하기',
    cancelVariant: 'default',
    confirmVariant: 'default',
    showCreditChip: false,
  },
};

export const LongContent: Story = {
  args: {
    title: '약관 동의',
    content:
      '서비스 이용약관 및 개인정보처리방침에 동의하시겠습니까?\n\n동의하시면 모든 기능을 자유롭게 이용하실 수 있습니다.\n동의하지 않으시면 일부 기능이 제한될 수 있습니다.\n\n언제든지 설정에서 변경하실 수 있습니다.',
    cancelText: '거부',
    confirmText: '동의',
    cancelVariant: 'default',
    confirmVariant: 'primary',
    showCreditChip: false,
  },
};
