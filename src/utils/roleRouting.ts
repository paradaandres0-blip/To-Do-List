export type AppRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export const normalizeRole = (role?: string | null): AppRole | null => {
  const normalized = (role ?? '').trim().toUpperCase();

  if (['ADMIN', 'ADMINISTRADOR', 'SUPERADMIN'].includes(normalized)) return 'ADMIN';
  if (['INSTRUCTOR', 'TEACHER', 'DOCENTE', 'PROFESOR'].includes(normalized)) return 'INSTRUCTOR';
  if (['STUDENT', 'ALUMNO', 'ESTUDIANTE'].includes(normalized)) return 'STUDENT';

  return null;
};

export const getHomeForRole = (role?: string | null): string => {
  const normalized = normalizeRole(role);

  if (normalized === 'INSTRUCTOR') return '/docente';
  if (normalized === 'STUDENT') return '/estudiante';
  return '/dashboard';
};
