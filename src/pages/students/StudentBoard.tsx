import { BookOpen, Calendar, CheckCircle, Target, TrendingUp } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const MOCK_COURSES = [
  { id: '1', name: 'Programación Web', progress: 75, teacher: 'Carlos Ruiz', sessions: 12 },
  { id: '2', name: 'Bases de Datos', progress: 40, teacher: 'Ana Gómez', sessions: 6 },
  { id: '3', name: 'Diseño UI/UX', progress: 90, teacher: 'Carlos Ruiz', sessions: 15 },
];

const MOCK_SESSIONS = [
  { id: '1', date: '2026-07-28', time: '10:00', course: 'Programación Web', status: 'Programada' },
  { id: '2', date: '2026-07-30', time: '14:00', course: 'Bases de Datos', status: 'Programada' },
];

/**
 * Tablero del estudiante: muestra cursos, progreso y próximas sesiones.
 */
export const StudentBoard = () => {
  const user = useAuthStore((s) => s.user);

  const overallProgress = Math.round(
    MOCK_COURSES.reduce((acc, c) => acc + c.progress, 0) / MOCK_COURSES.length,
  );

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: '#0f172a' }}>
          <BookOpen size={22} style={{ color: '#7c3aed' }} />
          Mi progreso
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
          Hola, {user?.name?.split(' ')[0] ?? 'Estudiante'}. Sigue tus cursos y sesiones.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 border" style={{ borderColor: '#f1f5f9' }}>
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} style={{ color: '#7c3aed' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#64748b' }}>Progreso global</span>
          </div>
          <p className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>{overallProgress}%</p>
        </div>
        <div className="bg-white rounded-xl p-3 border" style={{ borderColor: '#f1f5f9' }}>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={14} style={{ color: '#2563eb' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#64748b' }}>Cursos</span>
          </div>
          <p className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>{MOCK_COURSES.length}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border" style={{ borderColor: '#f1f5f9' }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} style={{ color: '#059669' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#64748b' }}>Completados</span>
          </div>
          <p className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>
            {MOCK_COURSES.filter(c => c.progress >= 80).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 border" style={{ borderColor: '#f1f5f9' }}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} style={{ color: '#d97706' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#64748b' }}>Sesiones</span>
          </div>
          <p className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>{MOCK_SESSIONS.length} prog.</p>
        </div>
      </div>

      {/* Courses */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Progreso de cursos */}
        <div className="bg-white rounded-xl border p-4 flex flex-col" style={{ borderColor: '#f1f5f9' }}>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#0f172a' }}>
            <TrendingUp size={16} style={{ color: '#7c3aed' }} />
            Mis cursos
          </h2>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {MOCK_COURSES.map((course) => (
              <div key={course.id} className="p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{course.name}</p>
                    <p className="text-[11px]" style={{ color: '#94a3b8' }}>{course.teacher} · {course.sessions} sesiones</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: course.progress >= 80 ? '#059669' : '#7c3aed' }}>
                    {course.progress}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: '#e2e8f0' }}>
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${course.progress}%`,
                      background: 'linear-gradient(90deg,#7c3aed,#2563eb)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximas sesiones */}
        <div className="bg-white rounded-xl border p-4 flex flex-col" style={{ borderColor: '#f1f5f9' }}>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#0f172a' }}>
            <Calendar size={16} style={{ color: '#2563eb' }} />
            Próximas sesiones
          </h2>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {MOCK_SESSIONS.map((session) => (
              <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20">
                  <Calendar size={18} style={{ color: '#7c3aed' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{session.course}</p>
                  <p className="text-[11px]" style={{ color: '#94a3b8' }}>
                    {session.date} · {session.time}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full border" style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  borderColor: '#a7f3d0',
                }}>
                  {session.status}
                </span>
              </div>
            ))}
            {MOCK_SESSIONS.length === 0 && (
              <div className="flex items-center justify-center h-24 text-xs" style={{ color: '#94a3b8' }}>
                No tienes sesiones programadas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};