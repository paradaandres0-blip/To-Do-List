import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Filter, Pencil, Trash2, X, ChevronDown, Mail, Phone, Award, Check, XCircle, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';

type StudentStatus = 'Activo' | 'Inactivo' | 'Suspendido' | 'Pendiente';

interface Student {
  id: string; name: string; email: string; phone: string;
  program: string; group: string; status: StudentStatus;
  sessions: number; progress: number; joinedAt: string;
}
interface StudentForm {
  name: string; email: string; phone: string;
  program: string; group: string; status: StudentStatus;
}
interface AssignForm {
  program: string;
  group: string;
}

const INITIAL: Student[] = [
  { id:'1', name:'Mariana López',  email:'mariana@mail.com', phone:'+57 300 111 2222', program:'Entrenamiento Funcional', group:'Cohorte Fitness 2026',  status:'Activo',     sessions:48, progress:82, joinedAt:'2025-01-10' },
  { id:'2', name:'Carlos Ruiz',    email:'carlos@mail.com',  phone:'+57 310 333 4444', program:'Nutrición Deportiva',     group:'Programa Nutrición Pro', status:'Activo',     sessions:41, progress:67, joinedAt:'2025-02-14' },
  { id:'3', name:'Laura Gómez',    email:'laura@mail.com',   phone:'+57 320 555 6666', program:'Mindfulness',             group:'Bienestar Mental',       status:'Activo',     sessions:37, progress:74, joinedAt:'2025-01-22' },
  { id:'4', name:'Diego Torres',   email:'diego@mail.com',   phone:'+57 315 777 8888', program:'Pérdida de Peso',         group:'Cohorte Fitness 2026',   status:'Activo',     sessions:33, progress:55, joinedAt:'2025-03-05' },
  { id:'5', name:'Sofía Martínez', email:'sofia@mail.com',   phone:'+57 311 999 0000', program:'Entrenamiento Funcional', group:'Cohorte Fitness 2026',   status:'Inactivo',   sessions:12, progress:28, joinedAt:'2025-02-28' },
  { id:'6', name:'Andrés Peña',    email:'andres@mail.com',  phone:'+57 305 123 4567', program:'Nutrición Deportiva',     group:'Programa Nutrición Pro', status:'Activo',     sessions:29, progress:60, joinedAt:'2025-04-01' },
  { id:'7', name:'Valentina Cruz', email:'vale@mail.com',    phone:'+57 318 234 5678', program:'Mindfulness',             group:'Bienestar Mental',       status:'Suspendido', sessions:5,  progress:10, joinedAt:'2025-03-15' },
  { id:'8', name:'Juliana Ríos',   email:'juliana@mail.com', phone:'+57 312 345 6789', program:'Pérdida de Peso',         group:'Cohorte Fitness 2026',   status:'Activo',     sessions:44, progress:90, joinedAt:'2025-01-05' },
];

const PROGRAMS = ['Entrenamiento Funcional','Nutrición Deportiva','Mindfulness','Pérdida de Peso','Fitness Funcional'];
const GROUPS   = ['Cohorte Fitness 2026','Programa Nutrición Pro','Bienestar Mental','Centro de Salud Vital'];
const STATUSES: StudentStatus[] = ['Activo','Inactivo','Suspendido','Pendiente'];

const statusStyle: Record<StudentStatus, string> = {
  Activo:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactivo:   'bg-slate-50   text-slate-500   border-slate-200',
  Suspendido: 'bg-red-50     text-red-600     border-red-200',
  Pendiente:  'bg-amber-50   text-amber-700   border-amber-200',
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen:boolean; onClose:()=>void; title:string; children:React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10" style={{ border:'1px solid #f1f5f9' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid #f1f5f9' }}>
          <h3 className="font-bold text-base" style={{ color:'#0f172a' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} style={{ color:'#94a3b8' }} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh]">{children}</div>
      </div>
    </div>
  );
};

export const Students = () => {
  const navigate = useNavigate();
  const [students,     setStudents]     = useState<Student[]>(INITIAL);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState<StudentStatus | 'Todos'>('Todos');
  const [filterProg,   setFilterProg]   = useState('Todos');
  const [showFilters,  setShowFilters]  = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState<Student | null>(null);
  const [deleteId,     setDeleteId]     = useState<string | null>(null);
  const [viewStudent,  setViewStudent]  = useState<Student | null>(null);
  const [assignModal,  setAssignModal]  = useState<Student | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StudentForm>();
  const { register: registerAssign, handleSubmit: handleAssign, reset: resetAssign, formState: { errors: assignErrors } } = useForm<AssignForm>();

  const filtered = useMemo(() => students.filter((s) => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.program.toLowerCase().includes(q))
      && (filterStatus === 'Todos' || s.status === filterStatus)
      && (filterProg   === 'Todos' || s.program === filterProg);
  }), [students, search, filterStatus, filterProg]);

  const openCreate = () => { setEditing(null); reset({ name:'', email:'', phone:'', program:'', group:'', status:'Activo' }); setModalOpen(true); };
  const openEdit   = (s: Student) => {
    setEditing(s);
    (['name','email','phone','program','group','status'] as const).forEach((k) => setValue(k, s[k] as never));
    setModalOpen(true);
  };
  const openAssign = (s: Student) => {
    setAssignModal(s);
    resetAssign({ program: s.program, group: s.group });
  };

  const onAssign = (data: AssignForm) => {
    if (assignModal) {
      setStudents((p) => p.map((st) => 
        st.id === assignModal.id ? { ...st, program: data.program, group: data.group } : st
      ));
      setAssignModal(null);
      resetAssign();
    }
  };

  const onSubmit = (data: StudentForm) => {
    if (editing) {
      setStudents((p) => p.map((s) => s.id === editing.id ? { ...s, ...data } : s));
    } else {
      setStudents((p) => [{ id: Date.now().toString(), ...data, sessions:0, progress:0, joinedAt: new Date().toISOString().split('T')[0] }, ...p]);
    }
    setModalOpen(false); reset();
  };

  const counts = useMemo(() => ({
    total: students.length,
    activos: students.filter((s) => s.status === 'Activo').length,
    inactivos: students.filter((s) => s.status === 'Inactivo').length,
    suspendidos: students.filter((s) => s.status === 'Suspendido').length,
    pendientes: students.filter((s) => s.status === 'Pendiente').length,
  }), [students]);

  const ic = () => `w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all`;
  const is = (e?: boolean) => ({ borderColor: e ? '#f87171' : '#e2e8f0', color:'#0f172a' });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color:'#0f172a' }}>
            <Users size={24} style={{ color:'#7c3aed' }} /> Gestión de Alumnos
          </h1>
          <p className="text-sm mt-1" style={{ color:'#64748b' }}>Registra, edita y asigna alumnos a programas.</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
          <Plus size={16} /> Registrar Alumno
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label:'Total',       value: counts.total,       color:'#7c3aed' },
          { label:'Activos',     value: counts.activos,     color:'#059669' },
          { label:'Inactivos',   value: counts.inactivos,   color:'#94a3b8' },
          { label:'Suspendidos', value: counts.suspendidos, color:'#ef4444' },
          { label:'Pendientes', value: counts.pendientes,  color:'#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 text-center"
            style={{ border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color:'#94a3b8' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Solicitudes Pendientes */}
      {counts.pendientes > 0 && (
        <div className="bg-white rounded-2xl p-5"
          style={{ border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color:'#0f172a' }}>
              <Users size={18} style={{ color:'#f59e0b' }} /> Solicitudes Pendientes ({counts.pendientes})
            </h3>
          </div>
          <div className="space-y-3">
            {students.filter((s) => s.status === 'Pendiente').map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-xl"
                style={{ background:'#fffbeb', border:'1px solid #fcd34d' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-extrabold"
                    style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color:'#0f172a' }}>{s.name}</p>
                    <p className="text-xs" style={{ color:'#92400e' }}>{s.email} • {s.program}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    setStudents((p) => p.map((st) => st.id === s.id ? { ...st, status: 'Activo' } : st));
                  }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all"
                    style={{ background:'linear-gradient(135deg,#059669,#10b981)' }}>
                    <Check size={14} /> Aceptar
                  </button>
                  <button onClick={() => {
                    setStudents((p) => p.filter((st) => st.id !== s.id));
                  }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-100 transition-all"
                    style={{ border:'1px solid #fca5a5', color:'#dc2626' }}>
                    <XCircle size={14} /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra búsqueda */}
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-3"
        style={{ border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Buscar por nombre, email o programa..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor:'#e2e8f0', color:'#0f172a' }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all"
            style={{ border:'1px solid #e2e8f0', color:'#475569' }}>
            <Filter size={14} /> Filtros
            <ChevronDown size={13} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2" style={{ borderTop:'1px solid #f8fafc' }}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color:'#94a3b8' }}>Estado</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StudentStatus | 'Todos')}
                className="text-sm rounded-lg px-3 py-2 border" style={{ borderColor:'#e2e8f0', color:'#0f172a' }}>
                <option value="Todos">Todos</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color:'#94a3b8' }}>Programa</label>
              <select value={filterProg} onChange={(e) => setFilterProg(e.target.value)}
                className="text-sm rounded-lg px-3 py-2 border" style={{ borderColor:'#e2e8f0', color:'#0f172a' }}>
                <option value="Todos">Todos</option>
                {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            {(filterStatus !== 'Todos' || filterProg !== 'Todos') && (
              <button onClick={() => { setFilterStatus('Todos'); setFilterProg('Todos'); }}
                className="self-end text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                style={{ color:'#f87171' }}>
                Limpiar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden bg-white"
        style={{ border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
              {['Alumno','Programa','Grupo','Progreso','Estado','Acciones'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider" style={{ color:'#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors cursor-pointer"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <td className="px-5 py-4" onClick={() => setViewStudent(s)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0"
                      style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color:'#0f172a' }}>{s.name}</p>
                      <p className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs font-medium" style={{ color:'#64748b' }}>{s.program}</td>
                <td className="px-5 py-4 text-xs font-medium" style={{ color:'#64748b' }}>{s.group}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full" style={{ background:'#f1f5f9' }}>
                      <div className="h-1.5 rounded-full" style={{ width:`${s.progress}%`, background:'linear-gradient(90deg,#7c3aed,#2563eb)' }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color:'#7c3aed' }}>{s.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyle[s.status]}`}>{s.status}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); openAssign(s); }}
                      className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <UserPlus size={13} style={{ color:'#3b82f6' }} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                      className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                      <Pencil size={13} style={{ color:'#7c3aed' }} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(s.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
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
            <Users size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No se encontraron alumnos</p>
          </div>
        )}
      </div>

      <button onClick={() => navigate('/dashboard')} className="text-xs font-medium hover:underline" style={{ color:'#94a3b8' }}>
        ← Volver al Dashboard
      </button>

      {/* Modal detalle */}
      <Modal isOpen={!!viewStudent} onClose={() => setViewStudent(null)} title="Detalle del Alumno">
        {viewStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold"
                style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                {viewStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-extrabold" style={{ color:'#0f172a' }}>{viewStudent.name}</h3>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyle[viewStudent.status]}`}>{viewStudent.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Mail,  label:'Email',    val: viewStudent.email   },
                { icon: Phone, label:'Teléfono', val: viewStudent.phone   },
                { icon: Award, label:'Programa', val: viewStudent.program },
                { icon: Users, label:'Grupo',    val: viewStudent.group   },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2 p-3 rounded-xl" style={{ background:'#f8fafc' }}>
                  <item.icon size={14} style={{ color:'#7c3aed', marginTop:'2px' }} />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color:'#94a3b8' }}>{item.label}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color:'#334155' }}>{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:'Sesiones', val: String(viewStudent.sessions) },
                { label:'Progreso', val: `${viewStudent.progress}%`  },
                { label:'Registro', val: new Date(viewStudent.joinedAt).toLocaleDateString('es-CO') },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-xl" style={{ background:'#f8fafc' }}>
                  <p className="text-xl font-extrabold" style={{ color:'#0f172a' }}>{s.val}</p>
                  <p className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => { setViewStudent(null); openEdit(viewStudent); }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                Editar alumno
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal crear/editar */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); }}
        title={editing ? 'Editar Alumno' : 'Registrar Alumno'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color:'#334155' }}>Nombre</label>
              <input placeholder="Ej: María García" className={ic()} style={is(!!errors.name)}
                {...register('name', { required:'Obligatorio' })} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color:'#334155' }}>Email</label>
              <input type="email" placeholder="mail@ejemplo.com" className={ic()} style={is(!!errors.email)}
                {...register('email', { required:'Obligatorio', pattern:{ value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message:'Inválido' } })} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color:'#334155' }}>Teléfono</label>
            <input placeholder="+57 300 000 0000" className={ic()} style={is(!!errors.phone)}
              {...register('phone', { required:'Obligatorio' })} />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color:'#334155' }}>Programa</label>
              <select className={ic()} style={is(!!errors.program)}
                {...register('program', { required:'Obligatorio' })}>
                <option value="">Seleccionar...</option>
                {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
              </select>
              {errors.program && <p className="text-xs text-red-500">{errors.program.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color:'#334155' }}>Grupo</label>
              <select className={ic()} style={is(!!errors.group)}
                {...register('group', { required:'Obligatorio' })}>
                <option value="">Seleccionar...</option>
                {GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
              {errors.group && <p className="text-xs text-red-500">{errors.group.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color:'#334155' }}>Estado</label>
            <select className={ic()} style={is()} {...register('status')}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setModalOpen(false); reset(); }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all"
              style={{ border:'1px solid #e2e8f0', color:'#475569' }}>Cancelar</button>
            <button type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
              {editing ? 'Guardar cambios' : 'Registrar alumno'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal eliminar */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmar eliminación">
        <div className="space-y-4">
          <p className="text-sm" style={{ color:'#475569' }}>¿Eliminar este alumno? Esta acción no se puede deshacer.</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteId(null)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all"
              style={{ border:'1px solid #e2e8f0', color:'#475569' }}>Cancelar</button>
            <button onClick={() => { if (deleteId) setStudents((p) => p.filter((s) => s.id !== deleteId)); setDeleteId(null); }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)' }}>Eliminar</button>
          </div>
        </div>
      </Modal>

      {/* Modal asignar a grupo/programa */}
      <Modal isOpen={!!assignModal} onClose={() => { setAssignModal(null); resetAssign(); }} title="Asignar a Grupo/Programa">
        {assignModal && (
          <form onSubmit={handleAssign(onAssign)} className="space-y-4">
            <div className="p-3 rounded-xl" style={{ background:'#f8fafc' }}>
              <p className="text-sm font-semibold" style={{ color:'#0f172a' }}>{assignModal.name}</p>
              <p className="text-xs" style={{ color:'#94a3b8' }}>{assignModal.email}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color:'#334155' }}>Programa</label>
              <select className={ic()} style={is(!!assignErrors.program)}
                {...registerAssign('program', { required:'Obligatorio' })}>
                <option value="">Seleccionar...</option>
                {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
              </select>
              {assignErrors.program && <p className="text-xs text-red-500">{assignErrors.program.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color:'#334155' }}>Grupo</label>
              <select className={ic()} style={is(!!assignErrors.group)}
                {...registerAssign('group', { required:'Obligatorio' })}>
                <option value="">Seleccionar...</option>
                {GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
              {assignErrors.group && <p className="text-xs text-red-500">{assignErrors.group.message}</p>}
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => { setAssignModal(null); resetAssign(); }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all"
                style={{ border:'1px solid #e2e8f0', color:'#475569' }}>Cancelar</button>
              <button type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background:'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
                Asignar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
