export interface Course {
  id:           string;
  title:        string;
  description:  string;
  group:        string;
  modulesCount: number;
  status:       'Publicado' | 'Borrador';
  lastUpdate:   string;
}
