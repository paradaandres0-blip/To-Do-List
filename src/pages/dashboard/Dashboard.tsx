import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, CheckCircle2, TrendingUp,
  Clock, MoreVertical, Download, ArrowUpRight,
  Dumbbell, Apple, Brain, Flame, RefreshCw, BarChart3,
  FileSpreadsheet, FileText, ExternalLink, ChevronDown, GraduationCap,
} from 'lucide-react';
import useMetricsStore from '../../store/metricsStore';
import useTaskStore, { formatRelativeTime } from '../../store/taskStore';
import useStudentStore from '../../store/studentStore';
import useReportStore from '../../store/reportStore';
import useAuthStore from '../../store/authStore';
import {
  buildMonthlySessionsChart,
  chartMiniStats,
  chartPeriodLabel,
  currentMonthBadge,
} from '../../utils/dashboardData';
import { exportSessionsCsv, exportSessionsPdf } from '../../utils/exportReport';

const statusStyle: Record<string, string> = {
  'Aprobada':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En revisión':    'bg-amber-50   text-amber-700   border-amber-200',
  'En desarrollo':  'bg-blue-50    text-blue-700    border-blue-200',
  'Pendiente':      'bg-slate-50   text-slate-500   border-slate-200',
};

// ── Categorías de programas ──
const CATEGORIES = [
  { label: 'Fitness',    icon: Dumbbell, pct: 42, color: '#7c3aed', students: 904  },
  { label: 'Nutrición',  icon: Apple,    pct: 28, color: '#2563eb', students: 602  },
  { label: 'Bienestar',  icon: Brain,    pct: 18, color: '#0ea5e9', students: 387  },
  { label: 'Motivación', icon: Flame,    pct: 12, color: '#10b981', students: 255  },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

export const Dashboard = () => {
  const navigate = useNavigate();
  const { metrics, isLoading, error, fetchMetrics, refreshMetrics } = useMetricsStore();
  const tasks = useTaskStore((s) => s.tasks);
  const getRecent = useTaskStore((s) => s.getRecent);
  const students = useStudentStore((s) => s.students);
  const getTopBySessions = useStudentStore((s) => s.getTopBySessions);
  const getByTeacherId = useStudentStore((s) => s.getByTeacherId);
  const reportSessions = useReportStore((s) => s.sessions);
  const user = useAuthStore((s) => s.user);
  const isInstructor = user?.role === 'instructor';

  const [exportOpen, setExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Actividad reciente real desde sesiones/tareas del store
  const recent = useMemo(() => getRecent(4), [getRecent, tasks]);

  useEffect(() => {
    if (!exportOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!exportMenuRef.current?.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [exportOpen]);

  const handleExportCsv = () => {
    exportSessionsCsv(reportSessions, `reporte-dashboard-${new Date().toISOString().slice(0, 10)}.csv`);
    setExportOpen(false);
  };

  const handleExportPdf = () => {
    exportSessionsPdf(reportSessions, currentMonthBadge());
    setExportOpen(false);
  };

  // Gráfica y top alumnos: data falsa dinámica (sin año 2025 hardcodeado)
  const chartBars = useMemo(() => buildMonthlySessionsChart(7), []);
  const chartStats = useMemo(() => chartMiniStats(chartBars), [chartBars]);
  const chartMax = useMemo(
    () => (chartBars.length ? Math.max(...chartBars.map((b) => b.val), 1) : 1),
    [chartBars],
  );
  const topStudents = useMemo(
    () => isInstructor && user?.teacherId
      ? getByTeacherId(user.teacherId).slice(0, 4)
      : getTopBySessions(4),
    [getTopBySessions, getByTeacherId, students, isInstructor, user?.teacherId],
  );
  const periodBadge = useMemo(() => currentMonthBadge(), []);
  const periodLabel = useMemo(() => chartPeriodLabel(chartBars), [chartBars]);

  // Carga métricas al montar (respeta caché de 1 min)
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // KPIs dinámicos desde el store — si no hay datos aún usa placeholders
  const instructorStudents = useMemo(
    () => isInstructor && user?.teacherId ? getByTeacherId(user.teacherId) : [],
    [getByTeacherId, isInstructor, user],
  );

  const STATS = isInstructor ? [
    {
      title: 'Mis Alumnos',
      value: instructorStudents.length.toString(),
      trend: 'Total',
      icon: Users, from: '#7c3aed', to: '#2563eb',
    },
    {
      title: 'Alumnos Activos',
      value: instructorStudents.filter((s) => s.status === 'Activo').length.toString(),
      trend: 'Activos',
      icon: CheckCircle2, from: '#059669', to: '#10b981',
    },
    {
      title: 'Sesiones Totales',
      value: instructorStudents.reduce((sum, s) => sum + s.sessions, 0).toString(),
      trend: 'Acumulado',
      icon: Clock, from: '#d97706', to: '#f59e0b',
    },
    {
      title: 'Progreso Promedio',
      value: instructorStudents.length > 0
        ? `${Math.round(instructorStudents.reduce((sum, s) => sum + s.progress, 0) / instructorStudents.length)}%`
        : '0%',
      trend: 'Promedio',
      icon: TrendingUp, from: '#2563eb', to: '#0ea5e9',
    },
  ] : [
    {
      title: 'Alumnos Activos',
      value: isLoading ? '…' : metrics ? metrics.studentsActive.toLocaleString() : '—',
      trend: metrics?.trends.students ?? '+0%',
      icon: Users, from: '#7c3aed', to: '#2563eb',
    },
    {
      title: 'Programas Activos',
      value: isLoading ? '…' : metrics ? metrics.programsActive.toLocaleString() : '—',
      trend: metrics?.trends.programs ?? '+0%',
      icon: BookOpen, from: '#2563eb', to: '#0ea5e9',
    },
    {
      title: 'Sesiones Completadas',
      value: isLoading ? '…' : metrics ? metrics.sessionsCompleted.toLocaleString() : '—',
      trend: metrics?.trends.sessions ?? '+0%',
      icon: CheckCircle2, from: '#059669', to: '#10b981',
    },
    {
      title: 'Satisfacción',
      value: isLoading ? '…' : metrics ? `${metrics.satisfaction}%` : '—',
      trend: metrics?.trends.satisfaction ?? '+0%',
      icon: TrendingUp, from: '#d97706', to: '#f59e0b',
    },
  ];
  return (
    <div className="w-full space-y-6">

      {/* ── Header ── */}
      <motion.div {...fade(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {isInstructor ? 'Mi Dashboard' : 'Dashboard — WorkFlow Academy'}
          </h1>
          <p className="text-sm mt-1 text-slate-500">
            {isInstructor ? 'Resumen de mis alumnos y sesiones.' : 'Resumen general de programas, alumnos y actividad.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Botón refresh - oculto para instructores */}
          {!isInstructor && (
            <button
              onClick={() => refreshMetrics()}
              disabled={isLoading}
              className="p-2.5 rounded-xl transition-all hover:bg-slate-100 disabled:opacity-50 border border-slate-200"
              title="Actualizar métricas">
              <RefreshCw size={15} className="text-slate-500" />
            </button>
          )}
          {/* Botón perfil docente - solo para instructores */}
          {isInstructor && (
            <button
              onClick={() => navigate('/docente/perfil')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all cursor-pointer bg-gradient-to-br from-purple-600 to-blue-600"
              title="Ver mi perfil">
              <GraduationCap size={15} /> Mi Perfil
            </button>
          )}
          {/* Botón exportar - solo para admin */}
          {!isInstructor && (
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setExportOpen((o) => !o)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all cursor-pointer bg-gradient-to-br from-purple-600 to-blue-600"
                aria-expanded={exportOpen}
                aria-haspopup="menu"
              >
                <Download size={15} /> Exportar Reporte
                <ChevronDown size={14} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
              </button>
              {exportOpen && (
                <div
                  role="menu"
                   className="absolute right-0 mt-2 w-56 rounded-xl bg-white py-1.5 z-20 border border-slate-200 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleExportCsv}
                     className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-left hover:bg-slate-50 transition-colors cursor-pointer text-slate-900"
                   >
                     <FileSpreadsheet size={15} className="text-emerald-600" />
                    Descargar CSV
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleExportPdf}
                     className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-left hover:bg-slate-50 transition-colors cursor-pointer text-slate-900"
                   >
                     <FileText size={15} className="text-purple-600" />
                    Exportar PDF
                  </button>
                   <div className="my-1.5 border-t border-slate-100" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setExportOpen(false);
                      navigate('/reports');
                    }}
                     className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-left hover:bg-slate-50 transition-colors cursor-pointer text-slate-900"
                   >
                     <ExternalLink size={15} className="text-blue-600" />
                    Abrir Reportes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Error de métricas */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 border border-red-200 text-red-600">
          ⚠️ {error}
          <button onClick={() => refreshMetrics()} className="ml-auto text-xs underline hover:no-underline">
            Reintentar
          </button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s, i) => (
          <motion.div key={s.title} {...fade(i * 0.07)}
            className="bg-white rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden border border-slate-100 shadow-sm">
            {/* Orbe */}
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-10"
              style={{ background: `radial-gradient(circle,${s.from},${s.to})` }} />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${s.from},${s.to})` }}>
                <s.icon size={20} className="text-white" />
              </div>
              {isLoading ? (
                <div className="h-6 w-12 rounded-full animate-pulse bg-slate-100" />
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  <ArrowUpRight size={11} />{s.trend}
                </span>
              )}
            </div>
            <div>
              {isLoading ? (
                <>
                  <div className="h-8 w-20 rounded-lg animate-pulse mb-2 bg-slate-100" />
                  <div className="h-4 w-28 rounded animate-pulse bg-slate-100" />
                </>
              ) : (
                <>
                  <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
                  <p className="text-sm font-medium mt-0.5 text-slate-500">{s.title}</p>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Fila media: gráfica + categorías ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Gráfica de barras SVG */}
        <motion.div {...fade(0.28)} className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Sesiones por Mes</h2>
              <p className="text-xs mt-0.5 text-slate-400">{periodLabel}</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <MoreVertical size={16} className="text-slate-400" />
            </button>
          </div>

          {chartBars.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-center" style={{ color: '#94a3b8' }}>
              <BarChart3 size={36} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">Sin datos de sesiones para mostrar</p>
              <p className="text-xs mt-1">Cuando haya actividad mensual, la gráfica aparecerá aquí.</p>
            </div>
          ) : (
            <div className="flex items-end gap-3 h-44 px-2">
              {chartBars.map((b, i) => {
                const heightPct = (b.val / chartMax) * 100;
                const isLast = i === chartBars.length - 1;
                return (
                  <div key={`${b.year}-${b.monthIndex}`} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className={`text-[10px] font-bold ${isLast ? 'text-purple-600' : 'text-slate-400'}`}>
                      {b.val}
                    </span>
                    <div className="w-full rounded-lg overflow-hidden flex items-end bg-slate-50" style={{ height: '120px' }}>
                      <div
                        className="w-full rounded-lg transition-all duration-700"
                        style={{
                          height: `${Math.max(heightPct, 4)}%`,
                          background: isLast
                            ? 'linear-gradient(180deg,#7c3aed,#a78bfa)'
                            : 'linear-gradient(180deg,#2563eb,#93c5fd)',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">{b.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100">
            {chartStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-xs mt-0.5 text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Categorías de programas */}
        <motion.div {...fade(0.33)} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-base font-bold mb-5 text-slate-900">Programas por Categoría</h2>
          <div className="space-y-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                     <cat.icon size={14} style={{ color: cat.color }} />
                     <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-sm font-bold" style={{ color: cat.color }}>{cat.pct}%</span>
                     <p className="text-[10px] text-slate-400">{cat.students} alumnos</p>
                   </div>
                 </div>
                 <div className="h-2 rounded-full bg-slate-100">
                   <div className="h-2 rounded-full transition-all duration-700"
                     style={{ width: `${cat.pct}%`, background: `linear-gradient(90deg,${cat.color},${cat.color}88)` }} />
                 </div>
               </div>
             ))}
           </div>

           {/* Total */}
           <div className="mt-5 pt-4 flex items-center justify-between border-t border-slate-100">
             <span className="text-sm font-medium text-slate-500">Total alumnos</span>
             <span className="text-lg font-extrabold text-slate-900">2,148</span>
           </div>
        </motion.div>
      </div>

      {/* ── Fila baja: actividad reciente + top alumnos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Actividad reciente */}
        <motion.div {...fade(0.4)} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Actividad Reciente</h2>
              <p className="text-xs mt-0.5 text-slate-400">Últimas sesiones y tareas</p>
            </div>
          </div>
          <div className="space-y-2">
            {recent.length === 0 ? (
              <p className="text-sm py-6 text-center text-slate-400">
                No hay actividad reciente
              </p>
            ) : (
              recent.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/tasks?id=${item.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/tasks?id=${item.id}`);
                    }
                  }}
                  className="w-full flex items-start gap-3 p-2 -mx-2 rounded-xl text-left transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-purple-50 border border-purple-100">
                    <Clock size={14} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-900">{item.title}</p>
                    <p className="text-xs mt-0.5 text-slate-400">{item.course}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tasks?status=${encodeURIComponent(item.status)}`);
                        }}
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border hover:opacity-80 cursor-pointer ${statusStyle[item.status] ?? ''}`}
                        title="Ver sesiones con este estado"
                      >
                        {item.status}
                      </button>
                      <span className="text-[11px] text-slate-300">
                        {formatRelativeTime(item.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="w-full mt-5 py-2 text-xs font-semibold rounded-xl transition-all hover:opacity-80 cursor-pointer bg-purple-50 border border-purple-200 text-purple-600">
            Ver toda la actividad →
          </button>
        </motion.div>

        {/* Top alumnos */}
        <motion.div {...fade(0.45)} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Alumnos</h2>
              <p className="text-xs mt-0.5 text-slate-400">Más sesiones este período</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
              {periodBadge}
            </span>
          </div>
          <div className="space-y-3">
            {topStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                <Users size={36} className="mb-2 opacity-30" />
                <p className="text-sm font-medium">No hay alumnos activos aún</p>
                <p className="text-xs mt-1">El ranking aparecerá cuando haya sesiones registradas.</p>
              </div>
            ) : (
              topStudents.map((s, i) => (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate('/students')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate('/students');
                    }
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer"
                >
                   <span className={`text-xs font-extrabold w-5 text-center flex-shrink-0 ${
                     i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : 'text-slate-300'
                   }`}>
                     #{i + 1}
                   </span>
                   <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0 bg-gradient-to-br from-purple-600 to-blue-600">
                     {(s.avatar ?? s.name.charAt(0)).toUpperCase()}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-semibold truncate text-slate-900">{s.name}</p>
                     <p className="text-xs truncate text-slate-400">{s.program}</p>
                   </div>
                   <div className="text-right flex-shrink-0">
                     <p className="text-sm font-extrabold text-slate-900">{s.sessions}</p>
                     <p className="text-[10px] text-slate-400">sesiones</p>
                   </div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => navigate('/students')}
            className="w-full mt-4 py-2 text-xs font-semibold rounded-xl transition-all hover:opacity-80 cursor-pointer bg-purple-50 border border-purple-200 text-purple-600">
            Ver todos los alumnos →
          </button>
        </motion.div>

      </div>
    </div>
  );
};
