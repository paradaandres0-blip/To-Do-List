import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Plus, Search, Filter, Clock,
  CheckCircle2, AlertCircle, Circle, Pencil,
  Trash2, X, ChevronDown,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

// ── Tipos ──
type Priority = 'Alta' | 'Media' | 'Baja';
type Status   = 'Pendiente' | 'En desarrollo' | 'En revisión' | 'Aprobada';

interface Task {
  id:       string;
  title:    string;
  course:   string;
  due:      string;
  priority: Priority;
  status:   Status;
}

interface TaskForm {
  title:    string;
  course:   string;
  due:      string;
  priority: Priority;
  status:   Status;
}

// ── Datos iniciales ──
const INITIAL_TASKS: Task[] = [
  { id:'1', title:'Plan Nutricional Semana 3',       course:'Nutrición Avanzada',   due:'2025-07-15', priority:'Alta',  status:'En revisión'   },
  { id:'2', title:'Rutina de Fuerza Nivel 2',        course:'Entrenamiento Físico', due:'2025-07-18', priority:'Alta',  status:'Aprobada'      },
  { id:'3', title:'Sesión de Meditación 10 min',     course:'Bienestar Mental',     due:'2025-07-20', priority:'Media', status:'En desarrollo' },
  { id:'4', title:'Evaluación de Composición Corp.', course:'Seguimiento Corporal', due:'2025-07-22', priority:'Media', status:'Pendiente'     },
  { id:'5', title:'Dieta Anti-inflamatoria',         course:'Nutrición Básica',     due:'2025-07-25', priority:'Baja',  status:'Pendiente'     },
  { id:'6', title:'Técnicas de Respiración',         course:'Bienestar Mental',     due:'2025-07-28', priority:'Alta',  status:'En desarrollo' },
];

const COURSES = ['Nutrición Avanzada','Entrenamiento Físico','Bienestar Mental','Seguimiento Corporal','Nutrición Básica','Fitness Funcional'];
const PRIORITIES: Priority[] = ['Alta','Media','Baja'];
const STATUSES:   Status[]   = ['Pendiente','En desarrollo','En revisión','Aprobada'];

// ── Estilos ──
const statusStyle: Record<Status, string> = {
  'Aprobada':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En revisión':    'bg-amber-50   text-amber-700   border-amber-200',
  'En desarrollo':  'bg-blue-50    text-blue-700    border-blue-200',
  'Pendiente':      'bg-slate-50   text-slate-500   border-slate-200',
};
const priorityStyle: Record<Priority, string> = {
  'Alta':  'bg-red-50    text-red-600    border-red-200',
  'Media': 'bg-orange-50 text-orange-600 border-orange-200',
  'Baja':  'bg-slate-50  text-slate-500  border-slate-200',
};
const statusIcon: Record<Status, React.ReactElement> = {
  'Aprobada':       <CheckCircle2 size={14} className="text-emerald-500" />,
  'En revisión':    <Clock        size={14} className="text-amber-500"   />,
  'En desarrollo':  <Circle       size={14} className="text-blue-500"    />,
  'Pendiente':      <AlertCircle  size={14} className="text-slate-400"   />,
};

// ── Modal reutilizable ──
const Modal = ({ isOpen, onClose, title, children }: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10"
        style={{ border: '1px solid #f1f5f9' }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h3 className="font-bold text-base" style={{ color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} style={{ color: '#94a3b8' }} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ── Componente principal ──
export const Tasks = () => {
  const navigate = useNavigate();

  const [tasks,       setTasks]       = useState<Task[]>(INITIAL_TASKS);
  const [search,      setSearch]      = useState('');
  const [filterPrio,  setFilterPrio]  = useState<Priority | 'Todas'>('Todas');
  const [filterStat,  setFilterStat]  = useState<Status | 'Todas'>('Todas');
  const [showFilters, setShowFilters] = useState(false);

  // Modal crear/editar
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingTask,  setEditingTask]  = useState<Task | null>(null);

  // Modal confirmar borrar
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskForm>();

  // ── Filtered list ──
  const filtered = useMemo(() => tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                        t.course.toLowerCase().includes(search.toLowerCase());
    const matchPrio   = filterPrio === 'Todas' || t.priority === filterPrio;
    const matchStat   = filterStat === 'Todas' || t.status   === filterStat;
    return matchSearch && matchPrio && matchStat;
  }), [tasks, search, filterPrio, filterStat]);

  // ── Abrir modal crear ──
  const openCreate = () => {
    setEditingTask(null);
    reset({ title:'', course:'', due:'', priority:'Media', status:'Pendiente' });
    setModalOpen(true);
  };

  // ── Abrir modal editar ──
  const openEdit = (task: Task) => {
    setEditingTask(task);
    setValue('title',    task.title);
    setValue('course',   task.course);
    setValue('due',      task.due);
    setValue('priority', task.priority);
    setValue('status',   task.status);
    setModalOpen(true);
  };

  // ── Guardar (crear o editar) ──
  const onSubmit = (data: TaskForm) => {
    if (editingTask) {
      setTasks((prev) => prev.map((t) => t.id === editingTask.id ? { ...t, ...data } : t));
    } else {
      const newTask: Task = { id: Date.now().toString(), ...data };
      setTasks((prev) => [newTask, ...prev]);
    }
    setModalOpen(false);
    reset();
  };

  // ── Eliminar ──
  const confirmDelete = () => {
    if (deleteId) setTasks((prev) => prev.filter((t) => t.id !== deleteId));
    setDeleteId(null);
  };

  // ── Cambio rápido de estado ──
  const cycleStatus = (id: string) => {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const idx  = STATUSES.indexOf(t.status);
      const next = STATUSES[(idx + 1) % STATUSES.length];
      return { ...t, status: next };
    }));
  };

  // ── Contadores por estado ──
  const counts = useMemo(() => ({
    total:     tasks.length,
    pendiente: tasks.filter((t) => t.status === 'Pendiente').length,
    revision:  tasks.filter((t) => t.status === 'En revisión').length,
    aprobada:  tasks.filter((t) => t.status === 'Aprobada').length,
  }), [tasks]);

  return (
    <div className="w-full space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2"
            style={{ color: '#0f172a' }}>
            <ClipboardList size={24} style={{ color: '#7c3aed' }} />
            Gestión de Sesiones
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Administra y supervisa las sesiones de todos los programas.
          </p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
          <Plus size={16} /> Nueva Sesión
        </button>
      </div>

      {/* ── KPI chips ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',       value: counts.total,     color: '#7c3aed' },
          { label: 'Pendientes',  value: counts.pendiente, color: '#f59e0b' },
          { label: 'En revisión', value: counts.revision,  color: '#2563eb' },
          { label: 'Aprobadas',   value: counts.aprobada,  color: '#059669' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 text-center"
            style={{ border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#94a3b8' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Barra de búsqueda y filtros ── */}
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-3"
        style={{ border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Buscar sesión o programa..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor:'#e2e8f0', color:'#0f172a' }}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-100"
            style={{ border:'1px solid #e2e8f0', color:'#475569' }}>
            <Filter size={14} />
            Filtros
            <ChevronDown size={13} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2" style={{ borderTop:'1px solid #f8fafc' }}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color:'#94a3b8' }}>Prioridad</label>
              <select value={filterPrio} onChange={(e) => setFilterPrio(e.target.value as Priority | 'Todas')}
                className="text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-purple-200"
                style={{ borderColor:'#e2e8f0', color:'#0f172a' }}>
                <option value="Todas">Todas</option>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color:'#94a3b8' }}>Estado</label>
              <select value={filterStat} onChange={(e) => setFilterStat(e.target.value as Status | 'Todas')}
                className="text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-purple-200"
                style={{ borderColor:'#e2e8f0', color:'#0f172a' }}>
                <option value="Todas">Todos</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            {(filterPrio !== 'Todas' || filterStat !== 'Todas') && (
              <button onClick={() => { setFilterPrio('Todas'); setFilterStat('Todas'); }}
                className="self-end text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                style={{ color:'#f87171' }}>
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Tabla ── */}
      <div className="rounded-2xl overflow-hidden bg-white"
        style={{ border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
              {['Sesión / Tarea','Programa','Vence','Prioridad','Estado','Acciones'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                  style={{ color:'#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((task, i) => (
              <tr key={task.id}
                className="hover:bg-slate-50 transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}>

                {/* Título */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {statusIcon[task.status]}
                    <span className="font-semibold" style={{ color:'#0f172a' }}>{task.title}</span>
                  </div>
                </td>

                {/* Programa */}
                <td className="px-5 py-4 text-xs font-medium" style={{ color:'#64748b' }}>{task.course}</td>

                {/* Fecha */}
                <td className="px-5 py-4 text-xs font-medium" style={{ color:'#64748b' }}>
                  {new Date(task.due).toLocaleDateString('es-CO', { day:'2-digit', month:'short' })}
                </td>

                {/* Prioridad */}
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityStyle[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>

                {/* Estado — click para ciclar */}
                <td className="px-5 py-4">
                  <button onClick={() => cycleStatus(task.id)}
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${statusStyle[task.status]}`}
                    title="Clic para cambiar estado">
                    {task.status}
                  </button>
                </td>

                {/* Acciones */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(task)}
                      className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors" title="Editar">
                      <Pencil size={13} style={{ color:'#7c3aed' }} />
                    </button>
                    <button onClick={() => setDeleteId(task.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                      <Trash2 size={13} style={{ color:'#f87171' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center" style={{ color:'#94a3b8' }}>
            <ClipboardList size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No se encontraron sesiones</p>
            <button onClick={() => { setSearch(''); setFilterPrio('Todas'); setFilterStat('Todas'); }}
              className="mt-2 text-xs font-semibold" style={{ color:'#7c3aed' }}>
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>

      {/* ── Volver al dashboard ── */}
      <button onClick={() => navigate('/dashboard')}
        className="text-xs font-medium hover:underline" style={{ color:'#94a3b8' }}>
        ← Volver al Dashboard
      </button>

      {/* ── Modal crear / editar ── */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); }}
        title={editingTask ? 'Editar Sesión' : 'Nueva Sesión'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color:'#334155' }}>Título</label>
            <input placeholder="Ej: Rutina de Fuerza Nivel 3"
              className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: errors.title ? '#f87171' : '#e2e8f0', color:'#0f172a' }}
              {...register('title', { required:'El título es obligatorio' })}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Programa */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color:'#334155' }}>Programa</label>
            <select className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: errors.course ? '#f87171' : '#e2e8f0', color:'#0f172a' }}
              {...register('course', { required:'Selecciona un programa' })}>
              <option value="">Seleccionar...</option>
              {COURSES.map((c) => <option key={c}>{c}</option>)}
            </select>
            {errors.course && <p className="text-xs text-red-500">{errors.course.message}</p>}
          </div>

          {/* Fecha límite */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color:'#334155' }}>Fecha límite</label>
            <input type="date"
              className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: errors.due ? '#f87171' : '#e2e8f0', color:'#0f172a' }}
              {...register('due', { required:'La fecha es obligatoria' })}
            />
            {errors.due && <p className="text-xs text-red-500">{errors.due.message}</p>}
          </div>

          {/* Prioridad + Estado en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color:'#334155' }}>Prioridad</label>
              <select className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                style={{ borderColor:'#e2e8f0', color:'#0f172a' }}
                {...register('priority')}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color:'#334155' }}>Estado</label>
              <select className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                style={{ borderColor:'#e2e8f0', color:'#0f172a' }}
                {...register('status')}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setModalOpen(false); reset(); }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all"
              style={{ border:'1px solid #e2e8f0', color:'#475569' }}>
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
              {editingTask ? 'Guardar cambios' : 'Crear sesión'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal confirmar eliminación ── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmar eliminación">
        <div className="space-y-4">
          <p className="text-sm" style={{ color:'#475569' }}>
            ¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteId(null)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all"
              style={{ border:'1px solid #e2e8f0', color:'#475569' }}>
              Cancelar
            </button>
            <button onClick={confirmDelete}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)' }}>
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
