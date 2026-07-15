export interface Student {
  id:        string;
  name:      string;
  email:     string;
  phone?:    string;
  program:   string;
  group:     string;
  status:    'Activo' | 'Inactivo' | 'Suspendido';
  sessions:  number;
  progress:  number; // 0-100
  joinedAt:  string;
  avatar?:   string;
  /** Docente asignado — FK a teachers.id (PostgreSQL futuro) */
  teacherId?: string;
}
