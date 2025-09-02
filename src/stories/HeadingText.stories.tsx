import HeadingText from '@/shared/components/text/HeadingText';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof HeadingText> = {
  title: 'typography/HeadingText',
  component: HeadingText,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '큰 제목과 작은 설명을 함께 보여주는 헤딩 텍스트 컴포넌트입니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeadingText>;

export const Default: Story = {
  args: {
    title: '제목',
    content: '내용내용내용',
  },
};

export const withSentence: Story = {
  args: {
    title: '집 구조에 대해 알려주세요',
    content:
      '하우미가 더 정밀하게 스타일링을 제안할 수 있도록 주거 형태와 평형, 도면 구조를 알려주세요',
  },
};
