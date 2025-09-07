import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NoMatchSheet } from '@/shared/components/bottomSheet/noMatchSheet/NoMatchSheet';

const meta: Meta<typeof NoMatchSheet> = {
  title: 'Sheet/NoMatchSheet',
  component: NoMatchSheet,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '집 구조 템플릿이 없을 때 유저가 주소를 공유할 수 있는 시트 컴포넌트입니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NoMatchSheet>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div
        style={{
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '1rem 2rem',
            borderRadius: '8px',
            backgroundColor: '#eee',
            cursor: 'pointer',
          }}
        >
          시트 열기
        </button>
        <NoMatchSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSubmit={() => setIsOpen(false)}
        />
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
