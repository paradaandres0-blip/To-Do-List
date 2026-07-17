import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginRequest, logoutRequest, getMeRequest, validateAvatarFile } from '../../services/authService';

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

describe('authService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.resetModules();
  });

  describe('validateAvatarFile', () => {
    it('returns null for valid file', () => {
      const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      const result = validateAvatarFile(file);
      expect(result).toBeNull();
    });

    it('returns error for file too large', () => {
      const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }); // 3MB
      const result = validateAvatarFile(file);
      expect(result?.code).toBe('SIZE_EXCEEDED');
    });

    it('returns error for invalid type', () => {
      const file = new File([''], 'avatar.gif', { type: 'image/gif' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });
      const result = validateAvatarFile(file);
      expect(result?.code).toBe('INVALID_TYPE');
    });
  });

  describe('loginRequest', () => {
    it('returns token and user on successful login', async () => {
      const result = await loginRequest({ email: 'admin@workflow.com', password: 'admin123' });
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('admin@workflow.com');
    });

    it('throws error for invalid credentials', async () => {
      await expect(loginRequest({ email: 'wrong@test.com', password: 'wrong' }))
        .rejects.toThrow();
    });
  });

  describe('logoutRequest', () => {
    it('completes without error', async () => {
      await expect(logoutRequest()).resolves.toBeUndefined();
    });
  });

  describe('getMeRequest', () => {
    it('returns user data', async () => {
      const result = await getMeRequest();
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});