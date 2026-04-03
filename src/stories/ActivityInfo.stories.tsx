import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';

import ActivityInfo from '@pages/imageSetup/steps/activityInfo/ActivityInfo';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ActivityInfo> = {
  title: 'pages/imageSetup/ActivityInfo',
  component: ActivityInfo,
  tags: ['autodocs'],
  args: {
    context: {
      floorPlan: { floorPlanId: 1, isMirror: false },
      moodBoardIds: [1, 2],
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ActivityInfo>;

// MSW 기본 핸들러(handlers.ts)가 성공 응답을 반환
export const Success: Story = {};

// 로딩 상태: 응답을 무기한 지연시켜 isPending=true 유지
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/dashboard-info', () => {
          return new Promise(() => {});
        }),
      ],
    },
  },
};

// 에러 상태: 500 응답으로 isError=true 유발
export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/dashboard-info', () => {
          return HttpResponse.json(
            { message: 'Server Error' },
            { status: 500 }
          );
        }),
      ],
    },
  },
};
