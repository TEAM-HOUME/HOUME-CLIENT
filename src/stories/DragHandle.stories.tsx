import type { Meta, StoryObj } from '@storybook/react-vite';
import { DragHandle } from '@/shared/components/dragHandle/DragHandle';

const meta = {
  title: 'Shared/DragHandle',
  component: DragHandle,
  parameters: {
    docs: {
      description: {
        component:
          '드래그 가능한 핸들을 나타내는 컴포넌트입니다. 보통 progress bar나 slider의 이동 표시용으로 사용됩니다.',
      },
    },
  },
} satisfies Meta<typeof DragHandle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {},
};
