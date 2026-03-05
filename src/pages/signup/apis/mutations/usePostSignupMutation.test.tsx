import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { postSignup, usePostSignupMutation } from './usePostSignupMutation';
import { server } from '../../../../mocks/server';
import { createWrapper } from '../../../../tests/utils';

const mockNavigate = vi.fn();
const mockSetUserName = vi.fn();
const mockSetAccessToken = vi.fn();
const mockNotify = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@store/useUserStore', () => ({
  useUserStore: vi.fn(
    (
      selector: (state: {
        setUserName: typeof mockSetUserName;
        setAccessToken: typeof mockSetAccessToken;
      }) => unknown
    ) =>
      selector({
        setUserName: mockSetUserName,
        setAccessToken: mockSetAccessToken,
      })
  ),
}));

vi.mock('@components/toast/useToast', () => ({
  useToast: () => ({ notify: mockNotify }),
}));

const createAuthWrapper = () => {
  const BaseWrapper = createWrapper();
  return ({ children }: { children: React.ReactNode }) => (
    <BaseWrapper>
      <MemoryRouter>{children}</MemoryRouter>
    </BaseWrapper>
  );
};

const mockRequest = {
  signupToken: 'mock-signup-token',
  name: '테스트',
  gender: 'MALE' as const,
  birthday: '2001-01-10',
};

// 성공 응답: access-token 헤더 + data에 userName
const successHandler = http.post('*/api/v1/sign-up', () =>
  HttpResponse.json(
    { code: 200, message: 'OK', data: '테스트' },
    { headers: { 'access-token': 'mock-access-token' } }
  )
);

describe('postSignup', () => {
  it('성공 시 userName과 accessToken을 반환한다', async () => {
    server.use(successHandler);

    const result = await postSignup(mockRequest);

    expect(result.userName).toBe('테스트');
    expect(result.accessToken).toBe('mock-access-token');
  });

  it('access-token 헤더가 없으면 에러를 던진다', async () => {
    server.use(
      http.post('*/api/v1/sign-up', () =>
        HttpResponse.json({ code: 200, message: 'OK', data: '테스트' })
      )
    );

    await expect(postSignup(mockRequest)).rejects.toThrow();
  });
});

describe('usePostSignupMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('signupToken', 'mock-signup-token');
  });

  it('성공 시 스토어 업데이트, sessionStorage 제거, WELCOME으로 이동한다', async () => {
    server.use(successHandler);

    const { result } = renderHook(() => usePostSignupMutation(), {
      wrapper: createAuthWrapper(),
    });

    act(() => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetUserName).toHaveBeenCalledWith('테스트');
    expect(mockSetAccessToken).toHaveBeenCalledWith('mock-access-token');
    expect(sessionStorage.getItem('signupToken')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/welcome');
  });

  it('API 에러 시 isError가 true이고 경고 토스트를 표시한다', async () => {
    server.use(
      http.post('*/api/v1/sign-up', () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => usePostSignupMutation(), {
      wrapper: createAuthWrapper(),
    });

    act(() => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockSetUserName).not.toHaveBeenCalled();
    expect(mockSetAccessToken).not.toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'warning' })
    );
  });
});
