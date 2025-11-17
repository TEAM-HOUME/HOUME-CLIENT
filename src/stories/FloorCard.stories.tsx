import FloorPlanItem from '@/shared/components/card/floorCard/FloorCard';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof FloorPlanItem> = {
  title: 'Components/FloorCard',
  component: FloorPlanItem,
  argTypes: {
    src: {
      control: 'text',
      defaultValue: '/images/example.png',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FloorPlanItem>;

export const Default: Story = {
  args: {
    src: '/images/example.png',
  },
};
