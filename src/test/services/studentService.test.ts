import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStudentsRequest, createStudentRequest } from '../../services/studentService';

// Mock del API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('studentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStudentsRequest', () => {
    it('debería retornar lista de estudiantes en modo mock', async () => {
      const result = await getStudentsRequest();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('pageSize');
      expect(result).toHaveProperty('totalPages');
    });

    it('debería tener estructura correcta de estudiante', async () => {
      const result = await getStudentsRequest();
      const student = result.data[0];
      expect(student).toHaveProperty('name');
      expect(student).toHaveProperty('email');
      expect(student).toHaveProperty('program');
      expect(student).toHaveProperty('status');
    });
  });

  describe('createStudentRequest', () => {
    it('debería crear estudiante en modo mock', async () => {
      const payload = {
        name: 'Test Student',
        email: 'test@example.com',
        phone: '+57 300 000 0000',
        program: 'Test Program',
        group: 'Test Group',
        status: 'Activo' as const,
      };

      const result = await createStudentRequest(payload);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(payload.name);
      expect(result.email).toBe(payload.email);
    });
  });
});
