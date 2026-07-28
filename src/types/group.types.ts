export interface GroupProgramAssignment {
  program: string;
  mentor: string;
}

export interface Group {
  id: string;
  name: string;
  centerId: string;
  status: 'En curso' | 'Inscripciones' | 'Finalizado';
  active: boolean;
  programs: GroupProgramAssignment[];
  createdAt: string;
  updatedAt: string;
}
