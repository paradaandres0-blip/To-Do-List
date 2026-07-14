import { useMemo, useState } from 'react';
import { BarChart2, TrendingUp, Users, BookOpen, CheckCircle2, Download } from 'lucide-react';
import useReportStore from '../../store/reportStore';

const FORMAT_DATE = (value: string) => new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

const REPORT_COLORS = {
  active: '#0ea5e9',
  registrations: '#7c3aed',
  progress: '#059669',
  completion: '#16a34a',
};

const SESSION_STATUSES = ['Todos', 'Completada', 'En curso', 'Pendiente'] as const;

export const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [program, setProgram] = useState('Todos');
  const [status, setStatus] = useState<typeof SESSION_STATUSES[number]>('Todos');

  const { students, sessions, programs } = useReportStore();

  const applyDateRange = (date: string) => {
    if (!fromDate || !toDate) return true;
    return date >= fromDate && date <= toDate;
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesProgram = program === 'Todos' || student.program === program;
      return matchesProgram && applyDateRange(student.joinedAt);
    });
  }, [students, fromDate, toDate, program]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesProgram = program === 'Todos' || session.course === program;
      const matchesStatus = status === 'Todos' || session.status === status;
      return matchesProgram && matchesStatus && applyDateRange(session.date);
    });
  }, [sessions, fromDate, toDate, program, status]);

  const metrics = useMemo(() => {
    const activeStudents = filteredStudents.filter((s) => s.status === 'Activo').length;
    const averageProgress = filteredStudents.length
      ? `${Math.round(filteredStudents.reduce((sum, s) => sum + s.progress, 0) / filteredStudents.length)}%`
      : '0%';
    const completionRate = filteredSessions.length
      ? `${Math.round((filteredSessions.filter((s) => s.status === 'Completada').length / filteredSessions.length) * 100)}%`
      : '0%';

    return [
      { label: 'Alumnos activos', value: activeStudents, sub: `${filteredStudents.length} registros`, color: REPORT_COLORS.active, icon: Users },
      { label: 'Nuevos registros', value: filteredStudents.length, sub: fromDate && toDate ? `Entre ${FORMAT_DATE(fromDate)} y ${FORMAT_DATE(toDate)}` : 'Todos los periodos', color: REPORT_COLORS.registrations, icon: BookOpen },
      { label: 'Avance promedio', value: averageProgress, sub: 'Promedio en el periodo', color: REPORT_COLORS.progress, icon: CheckCircle2 },
      { label: 'Cumplimiento', value: completionRate, sub: `${filteredSessions.filter((s) => s.status === 'Completada').length} de ${filteredSessions.length} sesiones`, color: REPORT_COLORS.completion, icon: TrendingUp },
    ];
  }, [filteredStudents, filteredSessions, fromDate, toDate]);

  const programProgress = useMemo(() => {
    return programs.map((name, idx) => {
      const programStudents = students.filter((student) => student.program === name);
      const total = programStudents.length;
      const pct = total
        ? Math.round(programStudents.reduce((sum, student) => sum + student.progress, 0) / total)
        : 0;
      return {
        name,
        pct,
        completed: programStudents.filter((student) => student.progress >= 75).length,
        total,
        color: ['#7c3aed', '#2563eb', '#0ea5e9', '#10b981', '#f97316'][idx % 5],
      };
    });
  }, [programs, students]);

  const exportCsv = () => {
    const header = ['Fecha', 'Curso', 'Estado', 'Duración (min)'];
    const rows = filteredSessions.map((session) => [session.date, session.course, session.status, String(session.duration)]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reportes-sesiones.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const rows = filteredSessions.map((session) => `
      <tr>
        <td style="padding:8px;border:1px solid #eceff1">${FORMAT_DATE(session.date)}</td>
        <td style="padding:8px;border:1px solid #eceff1">${session.course}</td>
        <td style="padding:8px;border:1px solid #eceff1">${session.status}</td>
        <td style="padding:8px;border:1px solid #eceff1">${session.duration} min</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Reporte de Sesiones</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a;">
          <h1>Reporte de Sesiones</h1>
          <p>Periodo: ${fromDate && toDate ? `${FORMAT_DATE(fromDate)} - ${FORMAT_DATE(toDate)}` : 'Todos los periodos'}</p>
          <table style="width:100%; border-collapse: collapse; margin-top:16px;">
            <thead>
              <tr>
                <th style="padding:8px;border:1px solid #cbd5e1;background:#f8fafc;text-align:left">Fecha</th>
                <th style="padding:8px;border:1px solid #cbd5e1;background:#f8fafc;text-align:left">Curso</th>
                <th style="padding:8px;border:1px solid #cbd5e1;background:#f8fafc;text-align:left">Estado</th>
                <th style="padding:8px;border:1px solid #cbd5e1;background:#f8fafc;text-align:left">Duración</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="margin-top:24px; font-size:0.95rem; color: #475569;">Sesiones totales: ${filteredSessions.length}</p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: '#0f172a' }}>
            <BarChart2 size={24} style={{ color: '#7c3aed' }} />
            Reportes y Métricas
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Analiza el rendimiento por programa, estudiantes y sesiones filtradas.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
          >
            <Download size={16} /> Exportar PDF
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Desde</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-2 w-full rounded-2xl border px-4 py-2 text-sm"
              style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Hasta</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-2 w-full rounded-2xl border px-4 py-2 text-sm"
              style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Programa</label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="mt-2 w-full rounded-2xl border px-4 py-2 text-sm"
              style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
            >
              <option value="Todos">Todos</option>
              {programs.map((prog) => <option key={prog} value={prog}>{prog}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Estado de sesión</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof SESSION_STATUSES[number])}
              className="mt-2 w-full rounded-2xl border px-4 py-2 text-sm"
              style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
            >
              {SESSION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>{metric.label}</p>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: `${metric.color}20` }}>
                <metric.icon size={18} style={{ color: metric.color }} />
              </div>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: '#0f172a' }}>{metric.value}</p>
            <p className="text-xs mt-2" style={{ color: '#94a3b8' }}>{metric.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>Avance por programa</h2>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Comparativa de progreso promedio y estudiantes con más del 75%.
            </p>
          </div>
          <p className="text-sm font-medium" style={{ color: '#64748b' }}>
            {fromDate && toDate ? `Periodo ${FORMAT_DATE(fromDate)} - ${FORMAT_DATE(toDate)}` : 'Todos los periodos'}
          </p>
        </div>
        <div className="space-y-4">
          {programProgress.map((course) => (
            <div key={course.name} className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold" style={{ color: '#0f172a' }}>{course.name}</p>
                <p className="text-sm font-bold" style={{ color: course.color }}>{course.pct}%</p>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${course.pct}%`, background: course.color }} />
              </div>
              <p className="mt-2 text-xs" style={{ color: '#94a3b8' }}>
                {course.completed} de {course.total} alumnos con avance superior a 75%
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>Sesiones filtradas</h2>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              {filteredSessions.length} registros encontrados.
            </p>
          </div>
          <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>
            {status !== 'Todos' ? status : 'Todos los estados'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                {['Fecha', 'Curso', 'Estado', 'Duración'].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold" style={{ color: '#64748b' }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3" style={{ color: '#0f172a' }}>{FORMAT_DATE(session.date)}</td>
                  <td className="px-4 py-3" style={{ color: '#475569' }}>{session.course}</td>
                  <td className="px-4 py-3" style={{ color: '#475569' }}>{session.status}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: '#0f172a' }}>{session.duration} min</td>
                </tr>
              ))}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                    No hay sesiones que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
