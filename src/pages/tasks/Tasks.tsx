import React, { useState } from 'react';
import {
  ClipboardList, Plus, Search, Filter, Clock,
  CheckCircle2, AlertCircle, Circle, Trash2, Pencil, X, Save,
} from 'lucide-react';
import { Modal } from '../../componets/common/Modal/Modal';
import { useForm } from 'react-hook-form';

// ── Tipos ──
interface Session {
  id:       string;
  title:    string;
  course:   string;
  due:      string;
  priority: 'Alta' | 'Media' | 'Baja';
  status:   'Aprobada' | 'En revisión' | 'En desarrollo' | 'Pendiente';
}

// ── Datos iniciales ──
const INITIAL: Session[] = [
  { id:'1', title:'Plan Nutricional Semana 3',       course:'Nutrición Avanzada',   due:'2025-07-15', priority:'Alta',  status:'En revisión'   },
  { id:'2', title:'Rutina de Fuerza Nivel 2',        course:'Entrenamiento Físico', due:'2025-07-18', priority:'Alta',  status:'Aprobada'      },
  { id:'3', title:'Sesión de Meditación 10 min',     course:'Bienestar Mental',     due:'2025-07-20', priority:'Media', status:'En desarrollo' },
  { id:'4', title:'Evaluación de Composición Corp.', course:'Seguimiento Corporal', due:'2025-07-22', priority:'Media', status:'Pendiente'     },
  { id:'5', title:'Dieta Anti-inflamatoria',         course:'Nutrición Básica',     due:'2025-07-25', priority:'Baja',  status:'Pendiente'     },
  { id:'6', title:'Técnicas de Respiración',         course:'Bienestar Mental',     due:'2025-07-28', priority:'Alta',  status:'En desarrollo' },
];

const STATUS_ICON: Record<string, React.ReactElement> = {
  'Aprobada':       <CheckCircle2 size={15} className="text-emerald-500" />,
  'En revisión':    <Clock        size={15} className="text-amber-500"   />,
  'En desarrollo':  <Circle       size={15} className="text-blue-500"    />,
  'Pendiente':      <AlertCircle  size={15} className="text-slate-400"   />,
};

const STATUS_STYLE: Record<string, string> = {
  'Aprobada':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En revisión':    'bg-amber-50   text-amber-700   border-amber-200',
  'En desarrollo':  'bg-blue-50    text-blue-700    border-blue-200',
  'Pendiente':      'bg-slate-50   text-slate-500   border-slate-200',
};

const PRIORITY_STYLE: Record<string, string> = {
  'Alta':  'bg-red-50    text-red-600    border-red-200',
  'Media': 'bg-orange-50 text-orange-600 border-orange-200',
  'Baja':  'bg-slate-50  text-slate-500  border-slate-200',
};

type SessionForm = Omit<Session, 'id'>;

export const Tasks = () => {
  const [sessions, setSessions] = useState<Session[]>(INITIAL);
  const [search,   setSearch]   = useState('');
  const [isOpen,   setIsOpen]   = useState(false);
  const [editing,  setEditing]  = useState<Session | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SessionForm>();

  const filtered = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase())
  );

  // ── Abrir modal nueva ──
  const openNew = () => {
    setEditing(null);
    reset({ title:'', course:'', due:'', priority:'Media', status:'Pendiente' });
    setIsOpen(true);
  };

  // ── Abrir modal editar ──
  const openEdit = (s: Session) => {
    setEditing(s);
    setValue('title',    s.title);
    setValue('course',   s.course);
    setValue('due',      s.due);
    setValue('priority', s.priority);
    setValue('status',   s.status);
    setIsOpen(true);
  };

  // ── Guardar (crear o actualizar) ──
  const onSubmit = (data: SessionForm) => {
    if (editing) {
      setSessions((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...data } : s));
    } else {
      setSessions((prev) => [{ id: Date.now().toString(), ...data }, ...prev]);
    }
    setIsOpen(false);
    reset();
  };

  // ── Eliminar ──
  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar esta sesión?')) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // ── Cambio rápido de estado ──
  const cycleStatus = (id: string) => {
    const order: Session['status'][] = ['Pendiente','En desarrollo','En revisión','Aprobada'];
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const idx = order.indexOf(s.status);
        return { ...s, status: order[(idx + 1) % order.length] };
      })
    );
  };

  // ── Stats ──
  const stats = [
    { label: 'Total',          value: sessions.length,                                    color: '#7c3aed' },
    { label: 'Aprobadas',      value: sessions.filter((s) => s.status === 'Aprobada').length,       color: '#059669' },
    { label: 'En revisión',    value: sessions.filter((s) => s.status === 'En revisión').length,    color: '#d97706' },
    { label: 'Pendientes',     value: sessions.filter((s) => s.status === 'Pendiente').length,      color: '#64748b' },
  ];

  return (
    <div className="w-full space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: '#0f172a' }}>
            <ClipboardList size={24} style={{ color: '#7c3aed' }} />
            Gestión de Sesiones
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Crea, edita y supervisa las sesiones de todos los programas.
          </p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
          <Plus size={16} /> Nueva Sesión
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 text-center"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#94a3b8' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Barra búsqueda */}
      <div className="flex gap-3 p-4 rounded-2xl"
        style={{ background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" placeholder="Buscar sesión o programa..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
            style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
          style={{ border: '1px solid #e2e8f0', color: '#475569' }}>
          <Filter size={14} /> Filtros
        </button>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden bg-white"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              {['Sesión', 'Programa', 'Fecha', 'Prioridad', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => cycleStatus(s.id)} title="Cambiar estado">
                      {STATUS_ICON[s.status]}
                    </button>
                    <span className="font-semibold" style={{ color: '#0f172a' }}>{s.title}</span>
                  </div>
                </td>

                <td className="px-5 py-4 text-xs font-medium" style={{ color: '#64748b' }}>{s.course}</td>

                <td className="px-5 py-4 text-xs font-medium" style={{ color: '#64748b' }}>
                  {new Date(s.due).toLocaleDateString('es-CO', { day:'2-digit', month:'short' })}
                </td>

                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[s.priority]}`}>
                    {s.priority}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLE[s.status]}`}>
                    {s.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(s)}
                      className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors" title="Editar">
                      <Pencil size={14} style={{ color: '#7c3aed' }} />
                    </button>
                    <button onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                      <Trash2 size={14} style={{ color: '#f87171' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center" style={{ color: '#94a3b8' }}>
            <ClipboardList size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No se encontraron sesiones</p>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); reset(); }}
        title={editing ? 'Editar Sesión' : 'Nueva Sesión'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: '#334155' }}>Título</label>
            <input placeholder="Ej. Rutina de Fuerza Semana 4"
              className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: errors.title ? '#f87171' : '#e2e8f0', color: '#0f172a' }}
              {...register('title', { required: 'El título es obligatorio' })}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Programa */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: '#334155' }}>Programa</label>
            <select className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
              {...register('course', { required: 'Selecciona un programa' })}>
              <option value="">Seleccionar...</option>
              {['Entrenamiento Físico','Nutrición Avanzada','Nutrición Básica','Bienestar Mental','Seguimiento Corporal'].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            {errors.course && <p className="text-xs text-red-500">{errors.course.message}</p>}
          </div>

          {/* Fecha + Prioridad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: '#334155' }}>Fecha</label>
              <input type="date"
                className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
                {...register('due', { required: 'La fecha es obligatoria' })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: '#334155' }}>Prioridad</label>
              <select className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
                {...register('priority')}>
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>
            </div>
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: '#334155' }}>Estado</label>
            <select className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
              {...register('status')}>
              <option>Pendiente</option>
              <option>En desarrollo</option>
              <option>En revisión</option>
              <option>Aprobada</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button"
              onClick={() => { setIsOpen(false); reset(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all"
              style={{ border: '1px solid #e2e8f0', color: '#475569' }}>
              <X size={14} /> Cancelar
            </button>
            <button type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
              <Save size={14} /> {editing ? 'Guardar cambios' : 'Crear sesión'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
