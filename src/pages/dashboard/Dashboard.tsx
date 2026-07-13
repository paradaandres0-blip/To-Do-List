import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, CheckCircle2, TrendingUp,
  Clock, MoreVertical, Download, ArrowUpRight,
  Dumbbell, Apple, Brain, Flame,
} from 'lucide-react';

// ── Métricas principales ──
const STATS = [
  { title: 'Alumnos Activos',       value: '2,148',  icon: Users,        trend: '+12%', from: '#7c3aed', to: '#2563eb' },
  { title: 'Programas Activos',     value: '58',     icon: BookOpen,     trend: '+8%',  from: '#2563eb', to: '#0ea5e9' },
  { title: 'Sesiones Completadas',  value: '12,430', icon: CheckCircle2, trend: '+22%', from: '#059669', to: '#10b981' },
  { title: 'Satisfacción',          value: '98%',    icon: TrendingUp,   trend: '+2%',  from: '#d97706', to: '#f59e0b' },
];

// ── Actividad reciente ──
const RECENT = [
  { id: 1, title: 'Plan Nutricional Semana 3',    module: 'Nutrición Avanzada',   status: 'En revisión',   time: 'Hace 2 h'  },
  { id: 2, title: 'Rutina de Fuerza — Nivel 2',   module: 'Entrenamiento Físico', status: 'Aprobada',      time: 'Hace 5 h'  },
  { id: 3, title: 'Meditación Guiada 10 min',     module: 'Bienestar Mental',     status: 'En desarrollo', time: 'Hace 1 día' },
  { id: 4, title: 'Evaluación Composición Corp.', module: 'Seguimiento Corporal', status: 'En revisión',   time: 'Hace 2 días'},
];

const statusStyle: Record<string, string> = {
  'Aprobada':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En revisión':    'bg-amber-50   text-amber-700   border-amber-200',
  'En desarrollo':  'bg-blue-50    text-blue-700    border-blue-200',
};

// ── Categorías de programas ──
const CATEGORIES = [
  { label: 'Fitness',    icon: Dumbbell, pct: 42, color: '#7c3aed', students: 904  },
  { label: 'Nutrición',  icon: Apple,    pct: 28, color: '#2563eb', students: 602  },
  { label: 'Bienestar',  icon: Brain,    pct: 18, color: '#0ea5e9', students: 387  },
  { label: 'Motivación', icon: Flame,    pct: 12, color: '#10b981', students: 255  },
];

// ── Top alumnos ──
const TOP_STUDENTS = [
  { name: 'Mariana López',  program: 'Fitness Funcional',   sessions: 48, avatar: 'M' },
  { name: 'Carlos Ruiz',    program: 'Nutrición Deportiva', sessions: 41, avatar: 'C' },
  { name: 'Laura Gómez',    program: 'Mindfulness',         sessions: 37, avatar: 'L' },
  { name: 'Diego Torres',   program: 'Pérdida de Peso',     sessions: 33, avatar: 'D' },
];

// ── Datos gráfica mensual ──
const CHART_BARS = [
  { label: 'Ene', val: 55  },
  { label: 'Feb', val: 80  },
  { label: 'Mar', val: 60  },
  { label: 'Abr', val: 110 },
  { label: 'May', val: 90  },
  { label: 'Jun', val: 130 },
  { label: 'Jul', val: 160 },
];
const maxVal = Math.max(...CHART_BARS.map((b) => b.val));

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

export const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full space-y-6">

      {/* ── Header ── */}
      <motion.div {...fade(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>
            Dashboard — WorkFlow Academy
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Resumen general de programas, alumnos y actividad.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
        >
          <Download size={15} /> Exportar Reporte
        </button>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s, i) => (
          <motion.div key={s.title} {...fade(i * 0.07)}
            className="bg-white rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {/* Orbe */}
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-10"
              style={{ background: `radial-gradient(circle,${s.from},${s.to})` }} />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${s.from},${s.to})` }}>
                <s.icon size={20} className="text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <ArrowUpRight size={11} />{s.trend}
              </span>
            </div>
            <div>
              <p className="text-3xl font-extrabold" style={{ color: '#0f172a' }}>{s.value}</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: '#64748b' }}>{s.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Fila media: gráfica + categorías ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Gráfica de barras SVG */}
        <motion.div {...fade(0.28)} className="lg:col-span-2 bg-white rounded-2xl p-6"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>Sesiones por Mes</h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Alumnos activos 2025</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <MoreVertical size={16} style={{ color: '#94a3b8' }} />
            </button>
          </div>

          {/* Barras SVG */}
          <div className="flex items-end gap-3 h-44 px-2">
            {CHART_BARS.map((b, i) => {
              const heightPct = (b.val / maxVal) * 100;
              const isLast = i === CHART_BARS.length - 1;
              return (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold" style={{ color: isLast ? '#7c3aed' : '#94a3b8' }}>
                    {b.val}
                  </span>
                  <div className="w-full rounded-lg overflow-hidden flex items-end" style={{ height: '120px', background: '#f8fafc' }}>
                    <div
                      className="w-full rounded-lg transition-all duration-700"
                      style={{
                        height: `${heightPct}%`,
                        background: isLast
                          ? 'linear-gradient(180deg,#7c3aed,#a78bfa)'
                          : 'linear-gradient(180deg,#2563eb,#93c5fd)',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>{b.label}</span>
                </div>
              );
            })}
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
            {[
              { label: 'Promedio',     value: '78%' },
              { label: 'Completado',   value: '64%' },
              { label: 'En proceso',   value: '28%' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-extrabold" style={{ color: '#0f172a' }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Categorías de programas */}
        <motion.div {...fade(0.33)} className="bg-white rounded-2xl p-6"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 className="text-base font-bold mb-5" style={{ color: '#0f172a' }}>Programas por Categoría</h2>
          <div className="space-y-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <cat.icon size={14} style={{ color: cat.color }} />
                    <span className="text-sm font-medium" style={{ color: '#334155' }}>{cat.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold" style={{ color: cat.color }}>{cat.pct}%</span>
                    <p className="text-[10px]" style={{ color: '#94a3b8' }}>{cat.students} alumnos</p>
                  </div>
                </div>
                <div className="h-2 rounded-full" style={{ background: '#f1f5f9' }}>
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${cat.pct}%`, background: `linear-gradient(90deg,${cat.color},${cat.color}88)` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-5 pt-4 flex items-center justify-between"
            style={{ borderTop: '1px solid #f1f5f9' }}>
            <span className="text-sm font-medium" style={{ color: '#64748b' }}>Total alumnos</span>
            <span className="text-lg font-extrabold" style={{ color: '#0f172a' }}>2,148</span>
          </div>
        </motion.div>
      </div>

      {/* ── Fila baja: actividad reciente + top alumnos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Actividad reciente */}
        <motion.div {...fade(0.4)} className="bg-white rounded-2xl p-6"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>Actividad Reciente</h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Últimas sesiones y tareas</p>
            </div>
          </div>
          <div className="space-y-4">
            {RECENT.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                  <Clock size={14} style={{ color: '#7c3aed' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{item.module}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyle[item.status] ?? ''}`}>
                      {item.status}
                    </span>
                    <span className="text-[11px]" style={{ color: '#cbd5e1' }}>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="w-full mt-5 py-2 text-xs font-semibold rounded-xl transition-all hover:opacity-80 cursor-pointer"
            style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)', color: '#7c3aed' }}>
            Ver toda la actividad →
          </button>
        </motion.div>

        {/* Top alumnos */}
        <motion.div {...fade(0.45)} className="bg-white rounded-2xl p-6"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>Top Alumnos</h2>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Más sesiones este mes</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}>
              Julio 2025
            </span>
          </div>
          <div className="space-y-3">
            {TOP_STUDENTS.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-slate-50">
                {/* Ranking */}
                <span className="text-xs font-extrabold w-5 text-center flex-shrink-0"
                  style={{ color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#d97706' : '#cbd5e1' }}>
                  #{i + 1}
                </span>
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{s.name}</p>
                  <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{s.program}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-extrabold" style={{ color: '#0f172a' }}>{s.sessions}</p>
                  <p className="text-[10px]" style={{ color: '#94a3b8' }}>sesiones</p>
                </div>
              </div>
            ))}
          </div>
          <button
<<<<<<< HEAD
<<<<<<< HEAD
            onClick={() => navigate('/groups')}
=======
            onClick={() => navigate('/students')}
>>>>>>> 1808959af09748b085c90ce2a89f767e6d2eaed4
=======
            onClick={() => navigate('/students')}
>>>>>>> 1808959af09748b085c90ce2a89f767e6d2eaed4
            className="w-full mt-4 py-2 text-xs font-semibold rounded-xl transition-all hover:opacity-80 cursor-pointer"
            style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)', color: '#7c3aed' }}>
            Ver todos los alumnos →
          </button>
        </motion.div>

      </div>
    </div>
  );
};
