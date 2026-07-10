import { BarChart2, TrendingUp, Users, BookOpen, CheckCircle2, Download } from 'lucide-react';

const METRICS = [
  { label: 'Tasa de Completado',  value: '87%',   sub: '+4% este mes',   icon: CheckCircle2, from: '#7c3aed', to: '#2563eb' },
  { label: 'Alumnos Activos',     value: '2,148',  sub: '+12% este mes',  icon: Users,        from: '#2563eb', to: '#0ea5e9' },
  { label: 'Sesiones Realizadas', value: '12,430', sub: '+22% este mes',  icon: BookOpen,     from: '#059669', to: '#10b981' },
  { label: 'Horas de Programa',   value: '4,840',  sub: '+18% este mes',  icon: TrendingUp,   from: '#d97706', to: '#f59e0b' },
];

const COURSE_PROGRESS = [
  { name: 'Entrenamiento Funcional', pct: 82, color: '#7c3aed' },
  { name: 'Nutrición Deportiva',     pct: 67, color: '#2563eb' },
  { name: 'Mindfulness',             pct: 74, color: '#0ea5e9' },
  { name: 'Pérdida de Peso',         pct: 55, color: '#10b981' },
  { name: 'Bienestar Mental',        pct: 40, color: '#f59e0b' },
];

export const Reports = () => {
  return (
    <div className="w-full space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: '#0f172a' }}>
            <BarChart2 size={24} style={{ color: '#7c3aed' }} />
            Reportes y Métricas
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Análisis de rendimiento por curso, grupo y período.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
        >
          <Download size={16} /> Exportar PDF
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `linear-gradient(135deg,${m.from},${m.to})` }}
            >
              <m.icon size={20} className="text-white" />
            </div>
            <p className="text-3xl font-extrabold" style={{ color: '#0f172a' }}>{m.value}</p>
            <p className="text-sm font-medium mt-0.5" style={{ color: '#64748b' }}>{m.label}</p>
            <p className="text-xs mt-1 font-semibold" style={{ color: '#16a34a' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Progreso por curso */}
      <div
        className="bg-white rounded-2xl p-6"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <h2 className="text-base font-bold mb-6" style={{ color: '#0f172a' }}>Progreso por Curso</h2>
        <div className="space-y-4">
          {COURSE_PROGRESS.map((c) => (
            <div key={c.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium" style={{ color: '#334155' }}>{c.name}</span>
                <span className="text-sm font-bold" style={{ color: c.color }}>{c.pct}%</span>
              </div>
              <div className="h-2.5 rounded-full" style={{ background: '#f1f5f9' }}>
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${c.pct}%`, background: `linear-gradient(90deg,${c.color},${c.color}99)` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
