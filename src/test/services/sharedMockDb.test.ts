import { beforeEach, describe, expect, it } from 'vitest';
import {
  CENTERS,
  GROUPS,
  SHARED_STUDENTS,
  canAddGroupToCenter,
  deactivateCenter,
  getGroupsByCenter,
  groupLimitForPlan,
} from '../../services/sharedMockDb';

describe('sharedMockDb center plan limits', () => {
  beforeEach(() => {
    CENTERS.splice(0, CENTERS.length, {
      id: 'c-test',
      name: 'Centro Test',
      website: 'www.test.com',
      plan: 'Básico',
      active: true,
    });

    GROUPS.splice(0, GROUPS.length, {
      id: 'g1',
      name: 'Grupo 1',
      centerId: 'c-test',
      mentor: 'Mentor',
      status: 'Inscripciones',
      program: 'Programa',
      active: true,
    }, {
      id: 'g2',
      name: 'Grupo 2',
      centerId: 'c-test',
      mentor: 'Mentor',
      status: 'Inscripciones',
      program: 'Programa',
      active: true,
    });

    SHARED_STUDENTS.splice(0, SHARED_STUDENTS.length, {
      id: 's1',
      name: 'Estudiante 1',
      email: 'student1@test.com',
      phone: '+57 300 000 0000',
      program: 'Programa',
      group: 'Grupo 1',
      status: 'Activo',
      active: true,
      sessions: 1,
      progress: 10,
      joinedAt: '2026-01-01',
      teacherId: 't1',
    });
  });

  it('limita los grupos según el plan del centro', () => {
    expect(groupLimitForPlan('Básico')).toBe(2);
    expect(groupLimitForPlan('Pro')).toBe(6);
    expect(groupLimitForPlan('Enterprise')).toBe(Number.MAX_SAFE_INTEGER);
    expect(canAddGroupToCenter('c-test')).toBe(false);
  });

  it('desactiva todos los grupos y alumnos del centro al desactivarlo', () => {
    deactivateCenter('c-test');

    const center = CENTERS.find((item) => item.id === 'c-test');
    const groups = getGroupsByCenter('c-test');
    const students = SHARED_STUDENTS.filter((student) => student.group === 'Grupo 1' || student.group === 'Grupo 2');

    expect(center?.active).toBe(false);
    expect(groups.every((group) => group.active === false)).toBe(true);
    expect(students.every((student) => student.active === false)).toBe(true);
  });
});
