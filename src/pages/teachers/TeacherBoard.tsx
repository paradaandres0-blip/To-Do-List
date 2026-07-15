import { useMemo, useState } from 'react';
import { LayoutGrid, Users, GripVertical } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useStudentStore from '../../store/studentStore';
import type { Student } from '../../types/student.types';

type ColumnId = 'nuevos' | 'progreso' | 'avanzados' | 'destacados';

const COLUMNS: Array<{
  id: ColumnId;
  title: string;
  hint: string;
  from: number;
  to: number;
  accent: string;
}> = [
  { id: 'nuevos',     title: 'Nuevos',       hint: '0–29%',  from: 0,  to: 29,  accent: '#94a3b8' },
  { id: 'progreso',   title: 'En progreso',  hint: '30–59%', from: 30, to: 59,  accent: '#2563eb' },
  { id: 'avanzados',  title: 'Avanzados',    hint: '60–79%', from: 60, to: 79,  accent: '#7c3aed' },
  { id: 'destacados', title: 'Destacados',   hint: '80–100%',from: 80, to: 100, accent: '#059669' },
];

const columnForProgress = (progress: number): ColumnId => {
  if (progress >= 80) return 'destacados';
  if (progress >= 60) return 'avanzados';
  if (progress >= 30) return 'progreso';
  return 'nuevos';
};

const midProgress = (col: ColumnId) => {
  const c = COLUMNS.find((x) => x.id === col)!;
  return Math.round((c.from + c.to) / 2);
};

/**
 * Tablero tipo Trello: el docente solo ve sus alumnos asignados.
 * Colores alineados con el dashboard (#7c3aed / #2563eb / #f8fafc).
 */
export const TeacherBoard = () => {
  const user = useAuthStore((s) => s.user);
  const students = useStudentStore((s) => s.students);
  const getByTeacherId = useStudentStore((s) => s.getByTeacherId);
  const updateStudentProgress = useStudentStore((s) => s.updateStudentProgress);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const myStudents = useMemo(() => {
    if (!user?.teacherId) return [];
    return getByTeacherId(user.teacherId);
  }, [user?.teacherId, getByTeacherId, students]);

  const byColumn = useMemo(() => {
    const map: Record<ColumnId, Student[]> = {
      nuevos: [],
      progreso: [],
      avanzados: [],
      destacados: [],
    };
    for (const s of myStudents) {
      map[columnForProgress(s.progress)].push(s);
    }
    return map;
  }, [myStudents]);

  const onDrop = (col: ColumnId) => {
    if (!draggingId) return;
    updateStudentProgress(draggingId, midProgress(col));
    setDraggingId(null);
  };

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
        <div>
          <h1
            className="text-xl font-extrabold tracking-tight flex items-center gap-2"
            style={{ color: '#0f172a' }}
          >
            <LayoutGrid size={22} style={{ color: '#7c3aed' }} />
            Tablero de alumnos
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
            Hola, {user?.name?.split(' ')[0] ?? 'Docente'}. Arrastra las tarjetas entre columnas.
          </p>
        </div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold"
          style={{
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            color: '#7c3aed',
          }}
        >
          <Users size={15} />
          {myStudents.length} alumnos
        </div>
      </div>

      {myStudents.length === 0 ? (
        <div
          className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-white"
          style={{ border: '1px solid #f1f5f9', minHeight: 280 }}
        >
          <Users size={40} className="mb-3 opacity-30" style={{ color: '#94a3b8' }} />
          <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
            Aún no tienes alumnos asignados
          </p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
            Cuando el admin te asigne estudiantes, aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max pb-2">
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                className="w-72 flex flex-col rounded-2xl flex-shrink-0"
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  maxHeight: '100%',
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(col.id)}
              >
                <div className="px-3 py-3 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: col.accent }}
                    />
                    <h2 className="text-sm font-bold" style={{ color: '#0f172a' }}>
                      {col.title}
                    </h2>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ background: '#fff', color: '#64748b' }}
                    >
                      {byColumn[col.id].length}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>
                    {col.hint}
                  </span>
                </div>

                <div className="px-2 pb-3 flex-1 overflow-y-auto space-y-2 min-h-[120px]">
                  {byColumn[col.id].map((student) => (
                    <div
                      key={student.id}
                      draggable
                      onDragStart={() => setDraggingId(student.id)}
                      onDragEnd={() => setDraggingId(null)}
                      className="bg-white rounded-xl p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md"
                      style={{
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        opacity: draggingId === student.id ? 0.6 : 1,
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical size={14} className="mt-1 flex-shrink-0" style={{ color: '#cbd5e1' }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-extrabold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
                            >
                              {student.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>
                                {student.name}
                              </p>
                              <p className="text-[11px] truncate" style={{ color: '#94a3b8' }}>
                                {student.program}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2.5">
                            <div className="flex justify-between text-[10px] mb-1">
                              <span style={{ color: '#64748b' }}>Avance</span>
                              <span className="font-bold" style={{ color: col.accent }}>
                                {student.progress}%
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${student.progress}%`,
                                  background: `linear-gradient(90deg,#7c3aed,#2563eb)`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span
                              className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border"
                              style={
                                student.status === 'Activo'
                                  ? { background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }
                                  : student.status === 'Inactivo'
                                    ? { background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }
                                    : { background: '#fef2f2', color: '#ef4444', borderColor: '#fecaca' }
                              }
                            >
                              {student.status}
                            </span>
                            <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                              {student.sessions} ses.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {byColumn[col.id].length === 0 && (
                    <div
                      className="rounded-xl border border-dashed py-8 text-center text-xs"
                      style={{ borderColor: '#cbd5e1', color: '#94a3b8' }}
                    >
                      Suelta alumnos aquí
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
