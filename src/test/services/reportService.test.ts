import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getReportsRequest, createReportSessionRequest, updateReportSessionRequest, deleteReportSessionRequest } from '../../services/reportService';

// Mock del API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('reportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReportsRequest', () => {
    it('debería retornar datos de reportes en modo mock', async () => {
      const result = await getReportsRequest();
      expect(result).toHaveProperty('students');
      expect(result).toHaveProperty('sessions');
      expect(result).toHaveProperty('programs');
      expect(Array.isArray(result.students)).toBe(true);
      expect(Array.isArray(result.sessions)).toBe(true);
      expect(Array.isArray(result.programs)).toBe(true);
    });

    it('debería tener estructura correcta de estudiante en reporte', async () => {
      const result = await getReportsRequest();
      const student = result.students[0];
      expect(student).toHaveProperty('id');
      expect(student).toHaveProperty('name');
      expect(student).toHaveProperty('program');
      expect(student).toHaveProperty('status');
      expect(student).toHaveProperty('progress');
    });

    it('debería tener estructura correcta de sesión en reporte', async () => {
      const result = await getReportsRequest();
      const session = result.sessions[0];
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('course');
      expect(session).toHaveProperty('date');
      expect(session).toHaveProperty('status');
      expect(session).toHaveProperty('duration');
    });
  });

  describe('createReportSessionRequest', () => {
    it('debería crear sesión de reporte en modo mock', async () => {
      const payload = {
        course: 'Test Course',
        date: '2025-07-20',
        status: 'Completada' as const,
        duration: 45,
      };

      const result = await createReportSessionRequest(payload);
      expect(result).toHaveProperty('id');
      expect(result.course).toBe(payload.course);
      expect(result.status).toBe(payload.status);
    });
  });

  describe('updateReportSessionRequest', () => {
    it('debería actualizar sesión de reporte en modo mock', async () => {
      const payload = {
        status: 'En curso' as const,
      };

      const result = await updateReportSessionRequest('1', payload);
      expect(result.status).toBe(payload.status);
    });
  });

  describe('deleteReportSessionRequest', () => {
    it('debería eliminar sesión de reporte en modo mock', async () => {
      await expect(deleteReportSessionRequest('1')).resolves.not.toThrow();
    });
  });
});
