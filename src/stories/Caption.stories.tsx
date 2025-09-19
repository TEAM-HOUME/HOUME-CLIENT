import Caption from '@/pages/imageSetup/components/caption/Caption';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Caption> = {
  title: 'Caption/Caption',
  component: Caption,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '캡션 컴포넌트입니다. 코드와 옵션 텍스트를 받아서 설명 문구를 생성합니다.',
      },
    },
  },
  argTypes: {
    code: {
      control: 'text',
      description: '선택된 코드 텍스트 (테두리 있는 칩으로 표시)',
    },
    option: {
      control: 'text',
      description: '옵션 텍스트 (기본 칩으로 표시)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Caption>;

export const Default: Story = {
  args: {
    code: 'A01',
    option: '침실',
  },
};

export const FloorPlan: Story = {
  args: {
    code: 'B02',
    option: '거실과 침실이 분리된 구조',
  },
};

export const InteriorStyle: Story = {
  args: {
    code: 'M01',
    option: '모던한 스타일의 인테리어',
  },
};

export const LongTexts: Story = {
  args: {
    code: 'LONG_CODE',
    option: '긴 텍스트 긴 텍스트 긴 텍스트 긴 텍스트 긴 텍스트 긴 텍스트 ',
  },
};
