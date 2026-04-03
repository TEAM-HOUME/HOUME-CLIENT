import { MemoryRouter } from 'react-router-dom';

import FunnelLayout from '@pages/imageSetup/components/layout/FunnelLayout';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'pages/imageSetup/FunnelLayout',
  component: FunnelLayout,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    currentStep: {
      control: { type: 'radio' },
      options: ['FloorPlanSelect', 'InteriorStyle', 'ActivityInfo'],
    },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          '이미지 설정 퍼널의 공통 레이아웃입니다. (NavBar + step별 콘텐츠 영역)',
      },
    },
  },
} satisfies Meta<typeof FunnelLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentStep: 'FloorPlanSelect',
    children: (
      <div style={{ padding: 16 }}>
        <div
          style={{
            height: 200,
            border: '1px dashed #D4DAE2',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Funnel step content
        </div>
      </div>
    ),
  },
};
