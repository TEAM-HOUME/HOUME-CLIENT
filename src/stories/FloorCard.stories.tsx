import type { Meta, StoryObj } from '@storybook/react-vite';
import FloorPlanItem from '@/shared/components/card/floorCard/FloorCard';

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
