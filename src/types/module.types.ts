export interface Module {
  id:       string;
  course:   string;
  title:    string;
  lessons:  number;
  duration: string;
  status:   'Publicado' | 'Borrador';
  progress: number; // 0-100
}
