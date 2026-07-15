export interface DashboardMetrics {
  studentsActive:    number;
  studentsTotal:     number;
  programsActive:    number;
  sessionsCompleted: number;
  satisfaction:      number; // porcentaje 0-100
  trends: {
    students:  string; // ej: "+12%"
    programs:  string;
    sessions:  string;
    satisfaction: string;
  };
}
