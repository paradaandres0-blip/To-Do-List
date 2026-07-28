import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAuthStore from '../../store/authStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('authStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset store state
    const { result } = renderHook(() => useAuthStore.getState());
    act(() => {
      result.current.logout();
    });
  });

  it('initializes with null user', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('sets user and token on login', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.login({
        email: 'admin@workflow.academy',
        password: '123456',
      });
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.user?.email).toBe('admin@workflow.academy');
    expect(result.current.token).toBeDefined();
  });

  it('clears state on logout', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    // First login
    await act(async () => {
      await result.current.login({
        email: 'admin@workflow.academy',
        password: '123456',
      });
    });

    expect(result.current.user).toBeDefined();

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('sets error on failed login', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      try {
        await result.current.login({
          email: 'wrong@test.com',
          password: 'wrong',
        });
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBeDefined();
  });

  it('clears error', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('updates user with setUser', () => {
    const { result } = renderHook(() => useAuthStore());
    const testUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const,
    };

    act(() => {
      result.current.setUser(testUser);
    });

    expect(result.current.user?.name).toBe('Test User');
    expect(result.current.user?.email).toBe('test@example.com');
  });
});