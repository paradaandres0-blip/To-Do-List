export interface Course {
  id: string;
  title: string;
  description: string;
  groups: string[];
  modulesCount: number;
  status: 'Activo' | 'Inactivo';
  lastUpdate: string;
}
