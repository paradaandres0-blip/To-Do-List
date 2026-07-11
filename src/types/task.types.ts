export interface Task {
  id:       string;
  title:    string;
  course:   string;
  due:      string;
  priority: 'Alta' | 'Media' | 'Baja';
  status:   'Aprobada' | 'En revisión' | 'En desarrollo' | 'Pendiente';
}
