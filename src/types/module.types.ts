export interface Module {
  id: string;
  course: string;
  title: string;
  lessons: number;
  duration: string;
  status: 'Activo' | 'Inactivo';
  progress: number; // 0-100
  assignedTeacherId?: string | null;
  assignedTeacherName?: string | null;
}
