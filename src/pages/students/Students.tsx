import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Filter, Pencil, Trash2, X, ChevronDown, Mail, Phone, Award, Check, XCircle, UserPlus, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentAssignmentSchema, studentSchema } from '../../schemas/student.schema';
import { Pagination } from '../../components/common/Pagination/Pagination';
import { getPasswordForAccount } from '../../services/mockDb';
import { CENTERS, GROUPS as SHARED_GROUPS, getCenterForGroup, getGroupByName, canAddStudentToGroup } from '../../services/sharedMockDb';
import useStudentStore from '../../store/studentStore';
import type { Student } from '../../types/student.types';

type StudentStatus = Student['status'];

interface StudentForm {
  name: string; email: string; phone: string;
  centerId: string; group: string; status: StudentStatus;
}
interface AssignForm {
  group: string;
}

// PROGRAMS and GROUPS will be derived inside the component so they reflect runtime changes
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

const PAGE_SIZE = 8;

export const Students = () => {
  const navigate = useNavigate();
  const students = useStudentStore((s) => s.students);
  const loadStudents = useStudentStore((s) => s.loadStudents);
  const getPendingRequests = useStudentStore((s) => s.getPendingRequests);
  const acceptRequest = useStudentStore((s) => s.acceptRequest);
  const rejectRequest = useStudentStore((s) => s.rejectRequest);
  const assignToGroup = useStudentStore((s) => s.assignToGroup);

  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState<StudentStatus | 'Todos'>('Todos');
  const [filterProg,   setFilterProg]   = useState('Todos');
  const [showFilters,  setShowFilters]  = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState<Student | null>(null);
  const [deleteId,     setDeleteId]     = useState<string | null>(null);
  const [viewStudent,  setViewStudent]  = useState<Student | null>(null);
  const [assignModal,  setAssignModal]  = useState<Student | null>(null);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
  });
  const selectedCenterId = watch('centerId');
  const selectedGroup = watch('group');
  const availableGroups = useMemo(() => selectedCenterId
    ? SHARED_GROUPS.filter((g) => g.centerId === selectedCenterId && g.active)
    : SHARED_GROUPS.filter((g) => g.active),
  [selectedCenterId]);

  const selectedCenter = useMemo(() => CENTERS.find((center) => center.id === selectedCenterId), [selectedCenterId]);
  const assignableGroups = useMemo(() => {
    if (!assignModal) return SHARED_GROUPS.filter((group) => group.active);
    const centerId = SHARED_GROUPS.find((group) => group.name === assignModal.group)?.centerId;
    return SHARED_GROUPS.filter((group) => group.active && (!centerId || group.centerId === centerId));
  }, [assignModal]);

  useEffect(() => {
    if (selectedCenterId && selectedGroup) {
      const stillValid = availableGroups.some((g) => g.name === selectedGroup);
      if (!stillValid) setValue('group', '');
    }
  }, [availableGroups, selectedCenterId, selectedGroup, setValue]);

  const { register: registerAssign, handleSubmit: handleAssign, reset: resetAssign, formState: { errors: assignErrors } } = useForm<AssignForm>({
    resolver: zodResolver(studentAssignmentSchema),
  });

  // Cargar estudiantes desde el store compartido al montar
  useEffect(() => {
    if (students.length === 0) {
      loadStudents();
    }
  }, [loadStudents, students.length]);

  // Derivar programas y grupos en cada render para reflejar cambios en sharedMockDb
  const PROGRAMS = Array.from(new Set(SHARED_GROUPS.map((g) => g.program)));

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      return (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.program.toLowerCase().includes(q))
        && (filterStatus === 'Todos' || s.status === filterStatus)
        && (filterProg   === 'Todos' || s.program === filterProg);
    });
  }, [students, search, filterStatus, filterProg]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterProg]);

  const pendingRequests = useMemo(() => getPendingRequests(), [getPendingRequests, students]);

  const openCreate = () => { setEditing(null); reset({ name:'', email:'', phone:'', centerId:'', group:'', status:'Activo' }); setModalOpen(true); };
  const openEdit   = (s: Student) => {
    setEditing(s);
    const group = getGroupByName(s.group);
    const centerId = group?.centerId ?? '';
    setValue('name', s.name);
    setValue('email', s.email);
    setValue('phone', s.phone ?? '');
    setValue('centerId', centerId);
    setValue('group', s.group);
    setValue('status', s.status);
    setModalOpen(true);
  };
  const openAssign = (s: Student) => {
    setAssignModal(s);
    resetAssign({ group: s.group });
  };

  const onAssign = async (data: AssignForm) => {
    if (assignModal) {
      try {
        await assignToGroup(assignModal.id, data.group);
        setAssignModal(null);
        resetAssign();
      } catch (err) {
        console.error('Error al asignar:', err);
        alert('Error al asignar el grupo');
      }
    }
  };

  const onSubmit = async (data: StudentForm) => {
    try {
      const { centerId, ...payload } = data;
      const isSameGroup = editing ? editing.group === payload.group : false;
      const selectedGroupData = SHARED_GROUPS.find((group) => group.name === payload.group);
      const centerForGroup = selectedGroupData ? CENTERS.find((center) => center.id === selectedGroupData.centerId) : undefined;
      if (centerForGroup && !centerForGroup.active) {
        alert('No puedes asignar alumnos a un grupo de un centro inactivo.');
        return;
      }
      if (!isSameGroup && !canAddStudentToGroup(payload.group)) {
        alert('Este grupo ya alcanzó la capacidad máxima de 25 alumnos. Selecciona otro grupo.');
        return;
      }

      if (editing) {
        await useStudentStore.getState().updateStudent(editing.id, {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          status: payload.status,
          group: payload.group,
        });
      } else {
        const { createStudentRequest } = await import('../../services/studentService');
        const created = await createStudentRequest(payload);
        await loadStudents();
        const pwd = getPasswordForAccount(created.email);
        if (pwd) {
          setCreatedEmail(created.email);
          setCreatedPassword(pwd);
          setPasswordModal(true);
        }
      }
      setModalOpen(false);
      reset();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar el estudiante');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { deleteStudentRequest } = await import('../../services/studentService');
      await deleteStudentRequest(deleteId);
      await loadStudents();
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar el estudiante');
    } finally {
      setDeleteId(null);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      await acceptRequest(id);
    } catch (err) {
      console.error('Error al aceptar:', err);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await rejectRequest(id);
    } catch (err) {
      console.error('Error al rechazar:', err);
    }
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
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-2xl p-5"
          style={{ border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color:'#0f172a' }}>
              <Users size={18} style={{ color:'#f59e0b' }} /> Solicitudes Pendientes ({pendingRequests.length})
            </h3>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((s) => (
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
                  <button onClick={() => handleAcceptRequest(s.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all"
                    style={{ background:'linear-gradient(135deg,#059669,#10b981)' }}>
                    <Check size={14} /> Aceptar
                  </button>
                  <button onClick={() => handleRejectRequest(s.id)}
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
            {paginatedItems.map((s, i) => (
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
        {filtered.length === 0 && paginatedItems.length === 0 && (
          <div className="py-16 text-center" style={{ color:'#94a3b8' }}>
            <Users size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No se encontraron alumnos</p>
          </div>
        )}
      </div>

      <Pagination
        page={currentPage}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

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
                { icon: Users, label:'Centro',   val: getCenterForGroup(viewStudent.group)?.name ?? 'Sin centro' },
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
              <label className="text-sm font-medium" style={{ color:'#334155' }}>Centro / Organización</label>
              <select className={ic()} style={is(!!errors.centerId)}
                {...register('centerId', { required:'Selecciona un centro' })}>
                <option value="">Seleccionar...</option>
                {CENTERS.map((center) => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
              {errors.centerId && <p className="text-xs text-red-500">{errors.centerId.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color:'#334155' }}>Grupo</label>
              <select className={ic()} style={is(!!errors.group)}
                {...register('group', { required:'Selecciona un grupo' })}>
                <option value="">Seleccionar...</option>
                {availableGroups.map((group) => (
                  <option key={group.name} value={group.name}>{group.name}</option>
                ))}
              </select>
              {errors.group && <p className="text-xs text-red-500">{errors.group.message}</p>}
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <p>{selectedCenter ? `El centro ${selectedCenter.name} permite un máximo de ${selectedCenter.plan === 'Básico' ? '2' : selectedCenter.plan === 'Pro' ? '6' : 'ilimitados'} grupos y cada grupo admite hasta 25 alumnos.` : 'Selecciona un centro para ver sus límites.'}</p>
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
            <button onClick={confirmDelete}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)' }}>Eliminar</button>
          </div>
        </div>
      </Modal>

      {/* Modal mostrar contraseña generada */}
      <Modal isOpen={passwordModal} onClose={() => setPasswordModal(false)} title="Alumno registrado exitosamente">
        <div className="space-y-4">
          <div className="p-4 rounded-xl" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
            <p className="text-sm font-semibold text-emerald-800 mb-2">✅ Credenciales de acceso</p>
            <div className="space-y-1 text-sm">
              <p style={{ color: '#065f46' }}>
                <span className="font-semibold">Correo:</span> {createdEmail}
              </p>
              <p style={{ color: '#065f46' }}>
                <span className="font-semibold">Contraseña:</span>{' '}
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{createdPassword}</span>
              </p>
            </div>
          </div>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            El estudiante puede iniciar sesión en el login con estas credenciales.
          </p>
          <div className="flex justify-end">
            <button onClick={() => setPasswordModal(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background:'linear-gradient(135deg,#059669,#10b981)' }}>
              Entendido
            </button>
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
              <label className="text-sm font-medium" style={{ color:'#334155' }}>Grupo</label>
              <select className={ic()} style={is(!!assignErrors.group)}
                {...registerAssign('group', { required:'Obligatorio' })}>
                <option value="">Seleccionar...</option>
                {assignableGroups.map((group) => <option key={group.name} value={group.name}>{group.name}</option>)}
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