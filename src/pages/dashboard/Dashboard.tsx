import { motion } from 'framer-motion';
import {
  Users, BookOpen, CheckCircle2, TrendingUp,
  Clock, MoreVertical, Download, ArrowUpRight,
} from 'lucide-react';

const STATS = [
  {
    title: 'Usuarios Activos',
    value: '1,248',
    icon: Users,
    trend: '+12%',
    gradientFrom: '#7c3aed',
    gradientTo: '#2563eb',
  },
  {
    title: 'Cursos Terminados',
    value: '342',
    icon: BookOpen,
    trend: '+5%',
    gradientFrom: '#2563eb',
    gradientTo: '#0ea5e9',
  },
  {
    title: 'Tareas Aprobadas',
    value: '8,942',
    icon: CheckCircle2,
    trend: '+22%',
    gradientFrom: '#059669',
    gradientTo: '#10b981',
  },
  {
    title: 'Productividad',
    value: '94%',
    icon: TrendingUp,
    trend: '+2%',
    gradientFrom: '#d97706',
    gradientTo: '#f59e0b',
  },
];

const RECENT_TASKS = [
  { id: 1, title: 'Implementar Auth',       module: 'Backend Node.js',  status: 'En revisión',    time: 'Hace 2 horas' },
  { id: 2, title: 'Diseño de Base de Datos', module: 'Arquitectura',     status: 'Aprobada',       time: 'Hace 5 horas' },
  { id: 3, title: 'Maquetación UI',          module: 'Frontend React',   status: 'En desarrollo',  time: 'Hace 1 día'   },
  { id: 4, title: 'Testing API REST',        module: 'QA',               status: 'En revisión',    time: 'Hace 2 días'  },
];

const statusStyle: Record<string, string> = {
  'Aprobada':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En revisión':    'bg-amber-50   text-amber-700   border-amber-200',
  'En desarrollo':  'bg-blue-50    text-blue-700    border-blue-200',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0  },
  transition: { duration: 0.35, delay },
});

export const Dashboard = () => {
  return (
    <div className="w-full space-y-8">

      {/* ── Encabezado ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>
            Dashboard General
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Resumen de actividad y métricas de la organización.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
        >
          <Download size={16} />
          Descargar Reporte
        </button>
      </motion.div>

      {/* ── Estadísticas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.title}
            {...fadeUp(i * 0.08)}
            className="bg-white rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}
          >
            {/* Orbe decorativo */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
              style={{ background: `radial-gradient(circle, ${stat.gradientFrom}, ${stat.gradientTo})` }}
            />

            <div className="flex items-center justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${stat.gradientFrom}, ${stat.gradientTo})` }}
              >
                <stat.icon size={20} className="text-white" />
              </div>
              <span
                className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: '#f0fdf4', color: '#16a34a' }}
              >
                <ArrowUpRight size={11} />
                {stat.trend}
              </span>
            </div>

            <div>
              <p className="text-3xl font-extrabold" style={{ color: '#0f172a' }}>{stat.value}</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: '#64748b' }}>{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Sección inferior ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráfica placeholder */}
        <motion.div
          {...fadeUp(0.35)}
          className="lg:col-span-2 bg-white rounded-2xl p-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>Avance de Estudiantes</h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Últimas 4 semanas</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <MoreVertical size={18} style={{ color: '#94a3b8' }} />
            </button>
          </div>

          {/* Placeholder gráfica */}
          <div
            className="w-full h-56 rounded-xl flex flex-col items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg,rgba(124,58,237,0.04),rgba(37,99,235,0.04))',
              border: '2px dashed rgba(124,58,237,0.15)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(37,99,235,0.08))' }}
            >
              <TrendingUp size={24} style={{ color: '#7c3aed' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#475569' }}>Gráfica de rendimiento</p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Próximamente con Recharts</p>
          </div>

          {/* Mini stats row */}
          <div className="grid grid-cols-3 gap-4 mt-5">
            {[
              { label: 'Promedio',   value: '78%' },
              { label: 'Completado', value: '64%' },
              { label: 'En curso',   value: '28%' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-extrabold" style={{ color: '#0f172a' }}>{s.value}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: '#94a3b8' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actividad reciente */}
        <motion.div
          {...fadeUp(0.42)}
          className="bg-white rounded-2xl p-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>Actividad Reciente</h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Últimas tareas</p>
            </div>
          </div>

          <div className="space-y-4">
            {RECENT_TASKS.map((task) => (
              <div key={task.id} className="flex gap-3 items-start">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
                >
                  <Clock size={14} style={{ color: '#7c3aed' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{task.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{task.module}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusStyle[task.status] ?? ''}`}
                    >
                      {task.status}
                    </span>
                    <span className="text-[11px]" style={{ color: '#cbd5e1' }}>{task.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="w-full mt-5 py-2 text-sm font-semibold rounded-xl transition-all hover:opacity-80"
            style={{
              background: 'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(37,99,235,0.06))',
              border: '1px solid rgba(124,58,237,0.15)',
              color: '#7c3aed',
            }}
          >
            Ver toda la actividad
          </button>
        </motion.div>

      </div>
    </div>
  );
};
