import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTeachersRequest, createTeacherRequest } from '../../services/teacherService';

// Mock del API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('teacherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTeachersRequest', () => {
    it('debería retornar lista de docentes en modo mock', async () => {
      const result = await getTeachersRequest();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('pageSize');
      expect(result).toHaveProperty('totalPages');
    });

    it('debería tener estructura correcta de docente', async () => {
      const result = await getTeachersRequest();
      const teacher = result.data[0];
      expect(teacher).toHaveProperty('name');
      expect(teacher).toHaveProperty('email');
      expect(teacher).toHaveProperty('specialties');
      expect(teacher).toHaveProperty('status');
    });
  });

  describe('createTeacherRequest', () => {
    it('debería crear docente en modo mock', async () => {
      const payload = {
        name: 'Test Teacher',
        email: 'teacher@example.com',
        phone: '+57 300 000 0000',
        city: 'Bogotá',
        specialties: ['Fitness', 'Nutrición'],
        status: 'Activo' as const,
      };

      const result = await createTeacherRequest(payload);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(payload.name);
      expect(result.email).toBe(payload.email);
    });
  });
});
