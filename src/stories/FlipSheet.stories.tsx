import { useState } from 'react';

import FlipSheet from '@components/bottomSheet/flipSheet/FlipSheet';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof FlipSheet> = {
  title: 'Sheet/FlipSheet',
  component: FlipSheet,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '이미지를 좌우반전할 수 있는 시트 컴포넌트입니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FlipSheet>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleFlipClick = () => {
      alert('이미지를 좌우 반전했습니다!');
    };

    const handleChooseClick = () => {
      alert('이미지를 선택했습니다!');
    };

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
        <FlipSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onFlipClick={handleFlipClick}
          onChooseClick={handleChooseClick}
          src={'/images/floorExample.png'}
          isFlipped={false}
        />
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
