/**
 * BASE DE DATOS MOCK CENTRALIZADA
 * 
 * Jerarquía: Centro → Grupos → Estudiantes
 *            Workflow Academy → Cursos → Docentes → Módulos → Actividades
 *            Cursos se asignan a Centros → Grupos se asocian a Cursos
 */

import { z } from 'zod';
import type { Student } from '../types/student.types';
import { studentSchema } from '../schemas/student.schema';
import { addMockAccount, removeMockAccount } from './mockDb';

// ─── TIPOS INTERNOS ───
export interface Center {
  id: string;
  name: string;
  website: string;
  plan: 'Enterprise' | 'Pro' | 'Básico';
  active: boolean;
}

export interface GroupProgramAssignment {
  program: string;
  mentor: string;
}

export interface Group {
  id: string;
  name: string;
  centerId: string;
  mentor: string;
  status: 'En curso' | 'Inscripciones' | 'Finalizado';
  program: string;
  programs?: GroupProgramAssignment[];
  active: boolean;
}

export interface CenterCourse {
  id: string;
  centerId: string;
  courseId: string;
  groupId: string; // grupo del centro que recibe este curso
}

export interface TeacherCourse {
  id: string;
  teacherId: string;
  courseId: string;
}

// ─── HELPER ───
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const createMockStudentSchema = studentSchema.omit({ centerId: true }).extend({
  centerId: z.string().trim().min(1).optional(),
});

const createMockStudent = (data: Partial<Student> & { id: string }): Student => {
  const validated = createMockStudentSchema.parse({
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    program: data.program,
    group: data.group,
    status: data.status,
    centerId: data.centerId ?? getCenterIdForGroup(data.group ?? ''),
  });
  return {
    ...validated,
    active: data.active ?? true,
    sessions: data.sessions ?? 0,
    progress: data.progress ?? 0,
    joinedAt: data.joinedAt ?? daysAgo(0),
    teacherId: data.teacherId ?? '',
  } as Student;
};

// ─── DATOS ───

// 1. Centros
export let CENTERS: Center[] = [
  { id: 'c1', name: 'WorkFlow Academy', website: 'www.workflowacademy.co', plan: 'Enterprise', active: true },
  { id: 'c2', name: 'Centro de Salud Vital', website: 'www.saludvital.co', plan: 'Pro', active: true },
];

// 2. Grupos (pertenecen a un Centro)
export let GROUPS: Group[] = [
  { id: 'g1', name: 'Cohorte Fitness 2026',         centerId: 'c1', mentor: 'Carlos Ruiz',  status: 'En curso',      program: 'Entrenamiento Funcional', active: true },
  { id: 'g2', name: 'Programa Nutrición Pro',        centerId: 'c1', mentor: 'Ana Gómez',    status: 'En curso',      program: 'Nutrición Deportiva',    active: true },
  { id: 'g3', name: 'Bienestar Mental',             centerId: 'c1', mentor: 'Julián Parada',status: 'Inscripciones', program: 'Mindfulness',             active: true },
  { id: 'g4', name: 'Pérdida de Peso Sostenible',    centerId: 'c2', mentor: 'Laura Silva',  status: 'Finalizado',    program: 'Pérdida de Peso',         active: true },
];

// 3. Estudiantes (pertenecen a un Grupo)
export let SHARED_STUDENTS: Student[] = [
  createMockStudent({ id:'1', name:'Mariana López', email:'mariana@mail.com', phone:'+57 300 111 2222', program:'Entrenamiento Funcional', group:'Cohorte Fitness 2026', centerId:'c1', status:'Activo', sessions:48, progress:82, joinedAt:'2025-01-10', teacherId:'t2' }),
  createMockStudent({ id:'2', name:'Carlos Ruiz', email:'carlos@mail.com', phone:'+57 310 333 4444', program:'Nutrición Deportiva', group:'Programa Nutrición Pro', centerId:'c1', status:'Activo', sessions:41, progress:67, joinedAt:'2025-02-14', teacherId:'t1' }),
  createMockStudent({ id:'3', name:'Laura Gómez', email:'laura@mail.com', phone:'+57 320 555 6666', program:'Mindfulness', group:'Bienestar Mental', centerId:'c1', status:'Activo', sessions:37, progress:74, joinedAt:'2025-01-22', teacherId:'t1' }),
  createMockStudent({ id:'4', name:'Diego Torres', email:'diego@mail.com', phone:'+57 315 777 8888', program:'Entrenamiento Funcional', group:'Cohorte Fitness 2026', centerId:'c1', status:'Activo', sessions:33, progress:55, joinedAt:'2025-03-05', teacherId:'t1' }),
  createMockStudent({ id:'5', name:'Sofía Martínez', email:'sofia@mail.com', phone:'+57 311 999 0000', program:'Entrenamiento Funcional', group:'Cohorte Fitness 2026', centerId:'c1', status:'Inactivo', sessions:12, progress:28, joinedAt:'2025-02-28', teacherId:'t2' }),
  createMockStudent({ id:'6', name:'Andrés Peña', email:'andres@mail.com', phone:'+57 305 123 4567', program:'Nutrición Deportiva', group:'Programa Nutrición Pro', centerId:'c1', status:'Activo', sessions:29, progress:60, joinedAt:'2025-04-01', teacherId:'t1' }),
  createMockStudent({ id:'7', name:'Valentina Cruz', email:'vale@mail.com', phone:'+57 318 234 5678', program:'Mindfulness', group:'Bienestar Mental', centerId:'c1', status:'Suspendido', sessions:5, progress:10, joinedAt:'2025-03-15', teacherId:'t1' }),
  createMockStudent({ id:'8', name:'Juliana Ríos', email:'juliana@mail.com', phone:'+57 312 345 6789', program:'Entrenamiento Funcional', group:'Cohorte Fitness 2026', centerId:'c1', status:'Activo', sessions:44, progress:90, joinedAt:'2025-01-05', teacherId:'t2' }),
  createMockStudent({ id:'9', name:'Estudiante Demo', email:'estudiante@workflow.academy', phone:'+57 320 555 0303', program:'Entrenamiento Funcional', group:'Cohorte Fitness 2026', centerId:'c1', status:'Activo', sessions:12, progress:45, joinedAt:'2025-06-01', teacherId:'t1' }),
];

// 4. Asignación: Curso → Centro → Grupo
export let CENTER_COURSES: CenterCourse[] = [
  { id: 'cc1', centerId: 'c1', courseId: '1', groupId: 'g1' }, // Entrenamiento Funcional → Cohorte Fitness
  { id: 'cc2', centerId: 'c1', courseId: '2', groupId: 'g2' }, // Nutrición Deportiva → Programa Nutrición Pro
  { id: 'cc3', centerId: 'c1', courseId: '3', groupId: 'g3' }, // Mindfulness → Bienestar Mental
  { id: 'cc4', centerId: 'c2', courseId: '1', groupId: 'g4' }, // Entrenamiento Funcional → Pérdida de Peso
];

// 5. Asignación: Docente → Curso
export let TEACHER_COURSES: TeacherCourse[] = [
  { id: 'tc1', teacherId: 't1', courseId: '1' },
  { id: 'tc2', teacherId: 't1', courseId: '2' },
  { id: 'tc3', teacherId: 't1', courseId: '3' },
  { id: 'tc4', teacherId: 't2', courseId: '1' },
];

// ─── FUNCIONES DE ACCESO ───

export const cloneStudents = () => SHARED_STUDENTS.map((s) => ({ ...s }));

export const addStudent = (student: Student): void => {
  SHARED_STUDENTS = [student, ...SHARED_STUDENTS];
  addMockAccount(student.email, student.name, 'student');
};

export const updateStudent = (id: string, payload: Partial<Student>): void => {
  const index = SHARED_STUDENTS.findIndex((s) => s.id === id);
  if (index !== -1) {
    const updatedStudent = { ...SHARED_STUDENTS[index], ...payload } as Student;
    if (payload.group) {
      updatedStudent.centerId = payload.centerId ?? getCenterIdForGroup(payload.group) ?? updatedStudent.centerId;
      updatedStudent.program = getProgramForGroup(payload.group) || updatedStudent.program;
    }
    SHARED_STUDENTS[index] = updatedStudent;
  }
};

export const removeStudent = (id: string): void => {
  const student = SHARED_STUDENTS.find((s) => s.id === id);
  if (student) removeMockAccount(student.email);
  SHARED_STUDENTS = SHARED_STUDENTS.filter((s) => s.id !== id);
};

export const getCenterById = (centerId: string): Center | undefined =>
  CENTERS.find((center) => center.id === centerId);

export const getCenterIdForGroup = (groupName: string): string | undefined => {
  const group = GROUPS.find((g) => g.name === groupName);
  return group?.centerId;
};

export const getCenterForGroup = (groupName: string): Center | undefined => {
  const group = GROUPS.find((g) => g.name === groupName);
  return group ? getCenterById(group.centerId) : undefined;
};

export const getGroupByName = (groupName: string): Group | undefined =>
  GROUPS.find((g) => g.name === groupName);

export const getStudentCountByGroup = (groupName: string): number =>
  SHARED_STUDENTS.filter((s) => s.group === groupName).length;

export const groupLimitForPlan = (plan: Center['plan']): number => {
  if (plan === 'Básico') return 2;
  if (plan === 'Pro') return 6;
  return Number.MAX_SAFE_INTEGER;
};

export const canAddGroupToCenter = (centerId: string): boolean => {
  const center = getCenterById(centerId);
  if (!center) return false;
  return getGroupsByCenter(centerId).length < groupLimitForPlan(center.plan);
};

export const canAddStudentToGroup = (groupName: string): boolean =>
  getStudentCountByGroup(groupName) < 25;

/** Agregar un grupo al centro indicado */
export const addGroup = (group: Group): void => {
  GROUPS = [group, ...GROUPS];
};

/** Actualizar grupo y propagar cambios de nombre a estudiantes */
export const updateGroup = (id: string, payload: Partial<Group>): void => {
  const idx = GROUPS.findIndex((g) => g.id === id);
  if (idx === -1) return;
  const old = GROUPS[idx];
  const updated = { ...old, ...payload };
  GROUPS[idx] = updated;
  // Si cambió el nombre del grupo, actualizar a los estudiantes asignados
  if (payload.name && payload.name !== old.name) {
    SHARED_STUDENTS = SHARED_STUDENTS.map((s) => s.group === old.name ? { ...s, group: payload.name as string } : s);
  }
};

export const removeGroup = (id: string): void => {
  const group = GROUPS.find((g) => g.id === id);
  if (!group) return;
  const studentEmailsToRemove = SHARED_STUDENTS.filter((s) => s.group === group.name).map((s) => s.email);
  SHARED_STUDENTS = SHARED_STUDENTS.filter((s) => s.group !== group.name);
  studentEmailsToRemove.forEach(removeMockAccount);
  GROUPS = GROUPS.filter((g) => g.id !== id);
};

/** Centros: agregar/editar/eliminar */
export const addCenter = (center: Center): void => {
  CENTERS = [center, ...CENTERS];
};

export const updateCenter = (id: string, payload: Partial<Center>): void => {
  const idx = CENTERS.findIndex((c) => c.id === id);
  if (idx === -1) return;
  CENTERS[idx] = { ...CENTERS[idx], ...payload };
};

export const deactivateCenter = (id: string): void => {
  const center = getCenterById(id);
  if (!center) return;
  updateCenter(id, { active: false });
  GROUPS = GROUPS.map((g) => g.centerId === id ? { ...g, active: false } : g);
  const groupNames = getGroupsByCenter(id).map((g) => g.name);
  SHARED_STUDENTS = SHARED_STUDENTS.map((s) => groupNames.includes(s.group) ? { ...s, active: false } : s);
};

export const activateCenter = (id: string): void => {
  const center = getCenterById(id);
  if (!center) return;
  updateCenter(id, { active: true });
  GROUPS = GROUPS.map((g) => g.centerId === id ? { ...g, active: true } : g);
  const groupNames = getGroupsByCenter(id).map((g) => g.name);
  SHARED_STUDENTS = SHARED_STUDENTS.map((s) => groupNames.includes(s.group) ? { ...s, active: true } : s);
};

export const removeCenter = (id: string): void => {
  // Al eliminar un centro, eliminar sus grupos y estudiantes asociados
  const groupNamesToRemove = GROUPS.filter((g) => g.centerId === id).map((g) => g.name);
  const studentEmailsToRemove = SHARED_STUDENTS.filter((s) => groupNamesToRemove.includes(s.group)).map((s) => s.email);
  SHARED_STUDENTS = SHARED_STUDENTS.filter((s) => !groupNamesToRemove.includes(s.group));
  studentEmailsToRemove.forEach(removeMockAccount);
  GROUPS = GROUPS.filter((g) => g.centerId !== id);
  CENTERS = CENTERS.filter((c) => c.id !== id);
};

/** Obtener estudiantes de un grupo */
export const getStudentsByGroup = (groupName: string): Student[] =>
  SHARED_STUDENTS.filter((s) => s.group === groupName);

/** Obtener grupos de un centro */
export const getGroupsByCenter = (centerId: string): Group[] =>
  GROUPS.filter((g) => g.centerId === centerId);

export const getProgramForGroup = (groupName: string): string =>
  GROUPS.find((group) => group.name === groupName)?.program ?? '';

export const getStudentsByCenter = (centerId: string): Student[] => {
  const groupNames = getGroupsByCenter(centerId).map((g) => g.name);
  return SHARED_STUDENTS.filter((student) => groupNames.includes(student.group));
};

/** Obtener cursos asignados a un grupo */
export const getCoursesForGroup = (groupId: string): string[] =>
  CENTER_COURSES.filter((cc) => cc.groupId === groupId).map((cc) => cc.courseId);

/** Obtener grupos que reciben un curso específico */
export const getGroupsForCourse = (courseId: string): Group[] => {
  const groupIds = CENTER_COURSES.filter((cc) => cc.courseId === courseId).map((cc) => cc.groupId);
  return GROUPS.filter((g) => groupIds.includes(g.id));
};

/** Obtener estudiantes que tienen acceso a un curso (a través de sus grupos) */
export const getStudentsForCourse = (courseId: string): Student[] => {
  const groupsForCourse = getGroupsForCourse(courseId);
  const groupNames = groupsForCourse.map((g) => g.name);
  return SHARED_STUDENTS.filter((s) => groupNames.includes(s.group));
};

/** Obtener cursos asignados a un docente */
export const getCoursesForTeacher = (teacherId: string): string[] =>
  TEACHER_COURSES.filter((tc) => tc.teacherId === teacherId).map((tc) => tc.courseId);

/** Obtener estudiantes visibles para un docente (de los cursos que imparte) */
export const getStudentsForTeacher = (teacherId: string): Student[] => {
  const courseIds = getCoursesForTeacher(teacherId);
  const studentSet = new Set<Student>();
  courseIds.forEach((cid) => {
    getStudentsForCourse(cid).forEach((s) => studentSet.add(s));
  });
  return [...studentSet];
};

/** Métricas reales desde los datos */
export const getSharedMetrics = () => {
  const activeStudents = SHARED_STUDENTS.filter((s) => s.status === 'Activo');
  const totalStudents = SHARED_STUDENTS.length;
  const studentsActive = activeStudents.length;
  const sessionsCompleted = SHARED_STUDENTS.reduce((sum, s) => sum + s.sessions, 0);
  const uniquePrograms = [...new Set(SHARED_STUDENTS.map((s) => s.program))];
  const programsActive = uniquePrograms.length;
  const averageProgress = activeStudents.length > 0
    ? Math.round(activeStudents.reduce((sum, s) => sum + s.progress, 0) / activeStudents.length)
    : 0;

  return {
    studentsActive,
    studentsTotal: totalStudents,
    programsActive: Math.max(programsActive, 1),
    sessionsCompleted,
    uniquePrograms,
    averageProgress,
  };
};

export default SHARED_STUDENTS;