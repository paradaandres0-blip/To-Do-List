import React from 'react';
import { useState } from 'react';
import { ClipboardList, Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react';

const TASKS = [
  { id: '1', title: 'Implementar autenticación JWT',      course: 'Backend Node.js',   due: '15 Jul', priority: 'Alta',   status: 'En revisión'   },
  { id: '2', title: 'Diseño de base de datos relacional', course: 'Arquitectura',      due: '18 Jul', priority: 'Alta',   status: 'Aprobada'      },
  { id: '3', title: 'Maquetación del Dashboard UI',       course: 'Frontend React',    due: '20 Jul', priority: 'Media',  status: 'En desarrollo' },
  { id: '4', title: 'Testing unitario de componentes',    course: 'QA & Testing',      due: '22 Jul', priority: 'Media',  status: 'Pendiente'     },
  { id: '5', title: 'Documentación de API REST',          course: 'Backend Node.js',   due: '25 Jul', priority: 'Baja',   status: 'Pendiente'     },
  { id: '6', title: 'Integración con servicios externos', course: 'Arquitectura',      due: '28 Jul', priority: 'Alta',   status: 'En desarrollo' },
];

const statusIcon: Record<string, React.ReactElement> = {
  'Aprobada':       <CheckCircle2 size={15} className="text-emerald-500" />,
  'En revisión':    <Clock        size={15} className="text-amber-500"   />,
  'En desarrollo':  <Circle       size={15} className="text-blue-500"    />,
  'Pendiente':      <AlertCircle  size={15} className="text-slate-400"   />,
};

const statusStyle: Record<string, string> = {
  'Aprobada':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En revisión':    'bg-amber-50   text-amber-700   border-amber-200',
  'En desarrollo':  'bg-blue-50    text-blue-700    border-blue-200',
  'Pendiente':      'bg-slate-50   text-slate-500   border-slate-200',
};

const priorityStyle: Record<string, string> = {
  'Alta':  'bg-red-50   text-red-600   border-red-200',
  'Media': 'bg-orange-50 text-orange-600 border-orange-200',
  'Baja':  'bg-slate-50  text-slate-500  border-slate-200',
};

export const Tasks = () => {
  const [search, setSearch] = useState('');

  const filtered = TASKS.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: '#0f172a' }}>
            <ClipboardList size={24} style={{ color: '#7c3aed' }} />
            Gestión de Tareas
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Administra y supervisa las tareas de todos los cursos.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
        >
          <Plus size={16} /> Nueva Tarea
        </button>
      </div>

      {/* Barra de herramientas */}
      <div
        className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl"
        style={{ background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar tarea o curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
            style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
          />
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-100"
          style={{ border: '1px solid #e2e8f0', color: '#475569' }}
        >
          <Filter size={15} /> Filtros
        </button>
      </div>

      {/* Tabla */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              {['Tarea', 'Curso', 'Vence', 'Prioridad', 'Estado'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((task, i) => (
              <tr
                key={task.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {statusIcon[task.status]}
                    <span className="font-semibold" style={{ color: '#0f172a' }}>{task.title}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs font-medium" style={{ color: '#64748b' }}>{task.course}</td>
                <td className="px-5 py-4 text-xs font-medium" style={{ color: '#64748b' }}>{task.due}</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityStyle[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyle[task.status]}`}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center" style={{ color: '#94a3b8' }}>
            <ClipboardList size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No se encontraron tareas</p>
          </div>
        )}
      </div>
    </div>
  );
};
