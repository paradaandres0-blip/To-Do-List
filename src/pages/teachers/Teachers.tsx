import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GraduationCap, Plus, Search, Pencil, Trash2, Eye,
  Mail, Phone, MapPin, Filter, X,
} from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Modal } from '../../components/common/Modal/Modal';
import type { Teacher, TeacherFormValues, TeacherStatus } from '../../types/teacher.types';
import { TEACHER_SPECIALTY_OPTIONS } from '../../types/teacher.types';
import {
  getTeachersRequest,
  createTeacherRequest,
  updateTeacherRequest,
  deleteTeacherRequest,
} from '../../services/teacherService';
import { teacherSchema } from '../../schemas/teacher.schema';

const STATUS_STYLE: Record<TeacherStatus, string> = {
  Activo:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactivo: 'bg-slate-50 text-slate-500 border-slate-200',
  Licencia: 'bg-amber-50 text-amber-700 border-amber-200',
};

export const Teachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TeacherStatus | 'Todos'>('Todos');
  const [formError, setFormError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      city: '',
      specialties: [],
      status: 'Activo',
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTeachersRequest();
        setTeachers(data);
      } catch (err) {
        console.error('Error al cargar docentes:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return teachers.filter((t) => {
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.specialties.some((s) => s.toLowerCase().includes(q));
      const matchStatus = filterStatus === 'Todos' || t.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [teachers, search, filterStatus]);

  const counts = useMemo(
    () => ({
      total: teachers.length,
      activos: teachers.filter((t) => t.status === 'Activo').length,
      inactivos: teachers.filter((t) => t.status === 'Inactivo').length,
      licencia: teachers.filter((t) => t.status === 'Licencia').length,
    }),
    [teachers],
  );

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    reset({
      name: '',
      email: '',
      phone: '',
      city: '',
      specialties: [],
      status: 'Activo',
    });
    setModalOpen(true);
  };

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher);
    setFormError(null);
    reset({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      city: teacher.city,
      specialties: [...teacher.specialties],
      status: teacher.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormError(null);
    reset();
  };

  const onSubmit = async (data: TeacherFormValues) => {
    setIsSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        specialties: data.specialties,
        status: data.status,
      };
      if (editing) {
        const updated = await updateTeacherRequest(editing.id, payload);
        setTeachers((prev) => prev.map((t) => (t.id === editing.id ? updated : t)));
      } else {
        const created = await createTeacherRequest(payload);
        setTeachers((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo guardar el docente';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTeacherRequest(deleteId);
      // Soft-delete: actualizar el status localmente en lugar de filtrar
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === deleteId ? { ...t, status: 'Inactivo' as TeacherStatus, updatedAt: new Date().toISOString() } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert('No se pudo desactivar el docente.');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight flex items-center gap-2"
            style={{ color: '#0f172a' }}
          >
            <GraduationCap size={24} style={{ color: '#7c3aed' }} />
            Docentes
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Crea y administra perfiles de docente (listo para conectar PostgreSQL).
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
          Nuevo Docente
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, color: '#7c3aed' },
          { label: 'Activos', value: counts.activos, color: '#059669' },
          { label: 'Inactivos', value: counts.inactivos, color: '#94a3b8' },
          { label: 'Licencia', value: counts.licencia, color: '#f59e0b' },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-2xl p-4 text-center"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <p className="text-2xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#94a3b8' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div
        className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, correo, ciudad o especialidad..."
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: '#94a3b8' }} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TeacherStatus | 'Todos')}
            className="text-sm rounded-xl px-3 py-2.5 border focus:outline-none focus:ring-2 focus:ring-purple-200"
            style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
          >
            <option value="Todos">Todos</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
            <option value="Licencia">Licencia</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[240px] bg-white rounded-2xl"
          style={{ border: '1px solid #f1f5f9' }}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mb-3" style={{ borderColor: '#7c3aed' }} />
          <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Cargando docentes...</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden bg-white"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {['Docente', 'Contacto', 'Ciudad', 'Especialidades', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#94a3b8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((teacher, i) => (
                <tr
                  key={teacher.id}
                  className="hover:bg-slate-50 transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate" style={{ color: '#0f172a' }}>{teacher.name}</p>
                        <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1 text-xs" style={{ color: '#64748b' }}>
                      <p className="flex items-center gap-1.5"><Mail size={12} /> {teacher.email}</p>
                      <p className="flex items-center gap-1.5"><Phone size={12} /> {teacher.phone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#64748b' }}>
                      <MapPin size={12} /> {teacher.city}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {teacher.specialties.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{ background: 'rgba(124,58,237,0.06)', color: '#7c3aed', borderColor: 'rgba(124,58,237,0.2)' }}>
                          {s}
                        </span>
                      ))}
                      {teacher.specialties.length > 2 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ color: '#94a3b8' }}>
                          +{teacher.specialties.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLE[teacher.status]}`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Ver perfil"
                        onClick={() => navigate(`/teachers/${teacher.id}`)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Eye size={14} style={{ color: '#2563eb' }} />
                      </button>
                      <button
                        type="button"
                        title="Editar"
                        onClick={() => openEdit(teacher)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Pencil size={14} style={{ color: '#7c3aed' }} />
                      </button>
                      <button
                        type="button"
                        title="Desactivar"
                        onClick={() => setDeleteId(teacher.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
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
              <GraduationCap size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No hay docentes para mostrar</p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-2 text-xs font-semibold"
                style={{ color: '#7c3aed' }}
              >
                Crear el primero →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal crear / editar */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar Docente' : 'Nuevo Docente'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(248,113,113,0.08)', color: '#ef4444', border: '1px solid rgba(248,113,113,0.2)' }}>
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre completo"
              placeholder="Ej: Ana Gómez"
              error={errors.name?.message}
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              })}
            />
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="docente@workflow.academy"
              error={errors.email?.message}
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Correo no válido',
                },
              })}
            />
            <Input
              label="Teléfono"
              placeholder="+57 300 000 0000"
              error={errors.phone?.message}
              {...register('phone', {
                required: 'El teléfono es obligatorio',
                minLength: { value: 7, message: 'Teléfono demasiado corto' },
              })}
            />
            <Input
              label="Ciudad"
              placeholder="Ej: Bogotá"
              error={errors.city?.message}
              {...register('city', {
                required: 'La ciudad es obligatoria',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-gray mb-1.5">
              Especialidades
            </label>
            <Controller
              name="specialties"
              control={control}
              rules={{
                validate: (v) =>
                  (Array.isArray(v) && v.length > 0) ||
                  'Selecciona al menos una especialidad',
              }}
              render={({ field }) => {
                const selected = field.value ?? [];
                return (
                  <div className="flex flex-wrap gap-2">
                    {TEACHER_SPECIALTY_OPTIONS.map((opt) => {
                      const active = selected.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            const next = active
                              ? selected.filter((s) => s !== opt)
                              : [...selected, opt];
                            field.onChange(next);
                          }}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer"
                          style={
                            active
                              ? {
                                  background: 'rgba(124,58,237,0.12)',
                                  borderColor: 'rgba(124,58,237,0.4)',
                                  color: '#7c3aed',
                                }
                              : { borderColor: '#e2e8f0', color: '#64748b' }
                          }
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                );
              }}
            />
            {errors.specialties && (
              <p className="text-xs text-red-500 mt-1.5">{errors.specialties.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 max-w-xs">
            <label className="text-sm font-medium text-dark-gray">Estado</label>
            <select
              className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-200"
              style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
              {...register('status')}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Licencia">Licencia</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal} leftIcon={<X size={14} />}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editing ? 'Guardar cambios' : 'Crear docente'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmar desactivación */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Desactivar docente"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#475569' }}>
            ¿Seguro que deseas desactivar este docente? El perfil cambiará a estado "Inactivo" pero los alumnos asignados no se verán afectados.
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete}>
              Desactivar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
