import CaptionChip from '@/pages/imageSetup/components/caption/CaptionChip';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CaptionChip> = {
  title: 'Caption/CaptionChip',
  component: CaptionChip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '캡션 칩 컴포넌트입니다. 텍스트와 테두리 옵션을 설정할 수 있습니다.',
      },
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: '표시할 텍스트',
    },
    stroke: {
      control: 'boolean',
      description: '테두리 표시 여부',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CaptionChip>;

export const Default: Story = {
  args: {
    text: '기본 캡션',
    stroke: false,
  },
};

export const WithStroke: Story = {
  args: {
    text: '테두리 있는 캡션',
    stroke: true,
  },
};

export const LongText: Story = {
  args: {
    text: '긴 텍스트를 포함하는 캡션 칩 예시입니다',
    stroke: false,
  },
};

export const LongTextWithStroke: Story = {
  args: {
    text: '긴 텍스트를 포함하는 테두리 있는 캡션 칩',
    stroke: true,
  },
};
