import { describe, expect, it } from 'vitest';
import { isActivityVisibleToStudent } from './activityVisibility';
import type { Activity } from '../types/activity.types';
import type { Course } from '../types/course.types';
import type { Group } from '../types/group.types';
import type { Student } from '../types/student.types';

const makeActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: 'activity-1',
  title: 'Actividad',
  description: 'Descripción',
  moduleId: 'module-1',
  course: 'Curso de Fuerza',
  studentId: '',
  teacherId: 'teacher-1',
  lesson: 'Lección 1',
  status: 'Pendiente',
  progress: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const makeStudent = (overrides: Partial<Student> = {}): Student => ({
  id: 'student-1',
  name: 'Ana',
  email: 'ana@example.com',
  phone: '123',
  program: 'Programación',
  group: 'Grupo A',
  status: 'Activo',
  active: true,
  sessions: 0,
  progress: 0,
  joinedAt: new Date().toISOString(),
  teacherId: 'teacher-1',
  ...overrides,
});

const makeCourse = (overrides: Partial<Course> = {}): Course => ({
  id: 'course-1',
  title: 'Curso de Fuerza',
  description: 'Curso',
  groups: ['Grupo A'],
  modulesCount: 1,
  status: 'Activo',
  lastUpdate: new Date().toISOString(),
  ...overrides,
});

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 'group-1',
  name: 'Grupo A',
  centerId: 'center-1',
  status: 'En curso',
  active: true,
  programs: [{ program: 'Programación', mentor: 'Docente 1' }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('isActivityVisibleToStudent', () => {
  it('shows activities directly assigned to the student', () => {
    const student = makeStudent();
    const activity = makeActivity({ studentId: student.id });

    expect(isActivityVisibleToStudent(activity, student, makeCourse(), makeGroup())).toBe(true);
  });

  it('shows activities for students in the matching group context', () => {
    const student = makeStudent();
    const activity = makeActivity({ studentId: '' });

    expect(isActivityVisibleToStudent(activity, student, makeCourse(), makeGroup())).toBe(true);
  });

  it('hides activities when the course does not belong to the student context', () => {
    const student = makeStudent();
    const activity = makeActivity({ studentId: '' });
    const course = makeCourse({ title: 'Curso de Música', groups: ['Grupo B'] });
    const group = makeGroup({ name: 'Grupo B', programs: [{ program: 'Música', mentor: 'Docente 2' }] });

    expect(isActivityVisibleToStudent(activity, student, course, group)).toBe(false);
  });
});
