import { MemoryRouter } from 'react-router-dom';

import TitleNavBar from '@/shared/components/navBar/TitleNavBar';

import CurationSkeleton from '@pages/generate/pages/result/curationSection/CurationSkeleton';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CurationSkeleton> = {
  title: 'pages/generate/CurationSkeleton',
  component: CurationSkeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '결과 페이지 큐레이션 영역의 스켈레톤 로딩 상태입니다. 이미지 영역 + 가구 큐레이션 리스트를 포함합니다.',
      },
    },
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div
          style={{
            width: '375px',
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
          }}
        >
          <TitleNavBar title="스타일링 이미지 생성" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 auto',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <Story />
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CurationSkeleton>;

export const Default: Story = {};
