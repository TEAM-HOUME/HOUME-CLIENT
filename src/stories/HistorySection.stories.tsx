import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import HistorySection from '@pages/mypage/components/history/HistorySection';

import { queryKeys } from '@constants/queryKey';

import type { MyPageImagesData } from '@/pages/mypage/types/apis/generateList';
import type { Meta, StoryObj } from '@storybook/react-vite';

const createQueryClient = (data: MyPageImagesData) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });

  queryClient.setQueryData(queryKeys.mypage.images(), data);

  return queryClient;
};

const meta = {
  title: 'pages/mypage/HistorySection',
  component: HistorySection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '마이페이지 이미지 생성 히스토리 섹션입니다. (스토리에서는 React Query 데이터를 mock으로 주입합니다.)',
      },
    },
  },
} satisfies Meta<typeof HistorySection>;

export default meta;
type Story = StoryObj<typeof meta>;

const withQueryData = (data: MyPageImagesData) => (Story: any) => {
  const queryClient = createQueryClient(data);

  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

export const WithHistories: Story = {
  decorators: [
    withQueryData({
      histories: [
        {
          generatedImageUrl: '/images/example.png',
          tasteTag: '우드',
          equilibrium: '8평',
          houseForm: '오피스텔',
          imageId: 1,
          houseId: 101,
        },
        {
          generatedImageUrl: '/images/example.png',
          tasteTag: '모던',
          equilibrium: '10평',
          houseForm: '원룸',
          imageId: 2,
          houseId: 102,
        },
      ],
    }),
  ],
};

export const Empty: Story = {
  decorators: [
    withQueryData({
      histories: [],
    }),
  ],
};
