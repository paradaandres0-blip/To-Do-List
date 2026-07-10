import { motion } from 'framer-motion';
import {
  Users, BookOpen, CheckCircle2, TrendingUp,
  Clock, MoreVertical, Download, ArrowUpRight,
} from 'lucide-react';

const STATS = [
  {
    title: 'Alumnos Activos',
    value: '2,148',
    icon: Users,
    trend: '+12%',
    gradientFrom: '#7c3aed',
    gradientTo: '#2563eb',
  },
  {
    title: 'Programas Activos',
    value: '58',
    icon: BookOpen,
    trend: '+8%',
    gradientFrom: '#2563eb',
    gradientTo: '#0ea5e9',
  },
  {
    title: 'Sesiones Completadas',
    value: '12,430',
    icon: CheckCircle2,
    trend: '+22%',
    gradientFrom: '#059669',
    gradientTo: '#10b981',
  },
  {
    title: 'Satisfacción',
    value: '98%',
    icon: TrendingUp,
    trend: '+2%',
    gradientFrom: '#d97706',
    gradientTo: '#f59e0b',
  },
];

const RECENT_TASKS = [
  { id: 1, title: 'Plan Nutricional Semana 3',   module: 'Nutrición Avanzada',   status: 'En revisión',    time: 'Hace 2 horas' },
  { id: 2, title: 'Rutina de Fuerza — Nivel 2',  module: 'Entrenamiento Físico', status: 'Aprobada',       time: 'Hace 5 horas' },
  { id: 3, title: 'Meditación Guiada 10 min',    module: 'Bienestar Mental',     status: 'En desarrollo',  time: 'Hace 1 día'   },
  { id: 4, title: 'Evaluación de Composición',   module: 'Seguimiento Corporal', status: 'En revisión',    time: 'Hace 2 días'  },
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
            Dashboard — WorkFlow Academy
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Resumen de programas, alumnos y sesiones activas.
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

          {/* Gráfica SVG de barras */}
          <div className="w-full h-56 relative">
            <svg viewBox="0 0 500 180" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0,1,2,3].map((i) => (
                <line key={i} x1="40" y1={10 + i*45} x2="490" y2={10 + i*45}
                  stroke="#f1f5f9" strokeWidth="1" />
              ))}
              {/* Barras */}
              {[
                { x: 60,  h: 90,  label: 'Ene', color: '#7c3aed' },
                { x: 120, h: 120, label: 'Feb', color: '#7c3aed' },
                { x: 180, h: 75,  label: 'Mar', color: '#7c3aed' },
                { x: 240, h: 145, label: 'Abr', color: '#7c3aed' },
                { x: 300, h: 100, label: 'May', color: '#2563eb' },
                { x: 360, h: 130, label: 'Jun', color: '#2563eb' },
                { x: 420, h: 160, label: 'Jul', color: '#2563eb' },
              ].map((b) => (
                <g key={b.label}>
                  <rect x={b.x} y={170 - b.h} width="35" height={b.h} rx="6"
                    fill={`url(#grad-${b.color.replace('#','')})`} opacity="0.85" />
                  <text x={b.x + 17} y="178" textAnchor="middle" fontSize="9" fill="#94a3b8">{b.label}</text>
                </g>
              ))}
              {/* Gradientes */}
              <defs>
                <linearGradient id="grad-7c3aed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="grad-2563eb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </svg>
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
