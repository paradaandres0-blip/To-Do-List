import { useEffect, useState, useMemo } from 'react';
import {
  GraduationCap, Mail, Phone, MapPin, Calendar, Loader2, Pencil, Users, Clock, Book, User,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useStudentStore from '../../store/studentStore';
import type { Teacher } from '../../types/teacher.types';
import { getTeacherByIdRequest, updateTeacherRequest } from '../../services/teacherService';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Modal } from '../../components/common/Modal/Modal';

/** Perfil del docente autenticado (misma paleta del dashboard). */
export const MyTeacherProfile = () => {
  const user = useAuthStore((s) => s.user);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', city: '' });
  const [formError, setFormError] = useState<string | null>(null);
  
  const getByTeacherId = useStudentStore((s) => s.getByTeacherId);
  const teacherStudents = useMemo(() => 
    teacher ? getByTeacherId(teacher.id) : [], 
    [teacher, getByTeacherId]
  );
  const totalSessions = useMemo(() => 
    teacherStudents.reduce((sum, s) => sum + (s.sessions || 0), 0), 
    [teacherStudents]
  );
  const teacherPrograms = useMemo(() => {
    const programs = new Set(teacherStudents.map((s) => s.program));
    return Array.from(programs).slice(0, 5);
  }, [teacherStudents]);

  useEffect(() => {
    const load = async () => {
      if (!user?.teacherId) {
        setError('Tu cuenta no está vinculada a un perfil de docente');
        setIsLoading(false);
        return;
      }
      try {
        const data = await getTeacherByIdRequest(user.teacherId);
        setTeacher(data);
      } catch {
        setError('No se pudo cargar el perfil');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.teacherId]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const openEdit = () => {
    if (!teacher) return;
    setEditForm({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      city: teacher.city,
    });
    setFormError(null);
    setIsEditing(true);
  };

  const closeEdit = () => {
    setIsEditing(false);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!teacher) return;
    
    // Validación de campos obligatorios
    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.phone.trim() || !editForm.city.trim()) {
      setFormError('Todos los campos son obligatorios');
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      setFormError('El formato del correo electrónico no es válido');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const updated = await updateTeacherRequest(teacher.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        city: editForm.city,
        specialties: teacher.specialties,
        status: teacher.status,
      });
      setTeacher(updated);
      closeEdit();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el perfil';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px]" style={{ color: '#94a3b8' }}>
        <Loader2 size={28} className="animate-spin mb-3" style={{ color: '#7c3aed' }} />
        <p className="text-sm font-medium">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center max-w-lg" style={{ border: '1px solid #f1f5f9' }}>
        <GraduationCap size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#94a3b8' }} />
        <p className="font-semibold" style={{ color: '#0f172a' }}>{error ?? 'Perfil no encontrado'}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight flex items-center gap-2"
            style={{ color: '#0f172a' }}
          >
            <GraduationCap size={24} style={{ color: '#7c3aed' }} />
            Mi perfil docente
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Datos del docente vinculados a tu cuenta.
          </p>
        </div>
        <Button leftIcon={<Pencil size={16} />} onClick={openEdit}>
          Editar perfil
        </Button>
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div
          className="px-6 py-8 flex flex-col sm:flex-row sm:items-center gap-5"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(37,99,235,0.06))',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
          >
            {teacher.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>
                {teacher.name}
              </h2>
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border"
                style={
                  teacher.status === 'Activo'
                    ? { background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }
                    : { background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }
                }
              >
                {teacher.status}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Rol: Docente · WorkFlow Academy
            </p>
          </div>
        </div>

        <div className="p-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
              Contacto
            </h3>
            <p className="flex items-center gap-2 text-sm" style={{ color: '#334155' }}>
              <Mail size={15} style={{ color: '#7c3aed' }} /> {teacher.email}
            </p>
            <p className="flex items-center gap-2 text-sm" style={{ color: '#334155' }}>
              <Phone size={15} style={{ color: '#7c3aed' }} /> {teacher.phone}
            </p>
            <p className="flex items-center gap-2 text-sm" style={{ color: '#334155' }}>
              <MapPin size={15} style={{ color: '#7c3aed' }} /> {teacher.city}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
              Especialidades
            </h3>
            <div className="flex flex-wrap gap-2">
              {teacher.specialties.map((s) => (
                <span
                  key={s}
                  className="text-xs font-semibold px-3 py-1 rounded-full border"
                  style={{
                    background: 'rgba(124,58,237,0.08)',
                    color: '#7c3aed',
                    borderColor: 'rgba(124,58,237,0.2)',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="flex items-center gap-2 text-xs pt-2" style={{ color: '#94a3b8' }}>
              <Calendar size={13} /> Actualizado {formatDate(teacher.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas del docente */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div
          className="bg-white rounded-2xl p-4 text-center"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <Users size={20} className="mx-auto mb-2" style={{ color: '#7c3aed' }} />
          <p className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>{teacherStudents.length}</p>
          <p className="text-xs font-medium mt-1" style={{ color: '#64748b' }}>Alumnos</p>
        </div>
        <div
          className="bg-white rounded-2xl p-4 text-center"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <Clock size={20} className="mx-auto mb-2" style={{ color: '#7c3aed' }} />
          <p className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>{totalSessions}</p>
          <p className="text-xs font-medium mt-1" style={{ color: '#64748b' }}>Sesiones</p>
        </div>
        <div
          className="bg-white rounded-2xl p-4 text-center"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <GraduationCap size={20} className="mx-auto mb-2" style={{ color: '#7c3aed' }} />
          <p className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>{teacher.specialties.length}</p>
          <p className="text-xs font-medium mt-1" style={{ color: '#64748b' }}>Especialidades</p>
        </div>
      </div>

      {/* Cursos asignados al docente */}
      <div
        className="bg-white rounded-2xl p-6"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#94a3b8' }}>
          <Book size={14} style={{ color: '#7c3aed' }} />
          Mis cursos
        </h3>
        {teacherPrograms.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: '#94a3b8' }}>
            No tienes cursos asignados
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {teacherPrograms.map((program) => (
              <span
                key={program}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                style={{
                  background: 'rgba(124,58,237,0.08)',
                  color: '#7c3aed',
                  borderColor: 'rgba(124,58,237,0.2)',
                }}
              >
                {program}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Mis estudiantes */}
      <div
        className="bg-white rounded-2xl p-6"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#94a3b8' }}>
          <User size={14} style={{ color: '#7c3aed' }} />
          Mis estudiantes
        </h3>
        {teacherStudents.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: '#94a3b8' }}>
            No tienes estudiantes asignados
          </p>
        ) : (
          <div className="space-y-3">
            {teacherStudents.slice(0, 5).map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>
                    {student.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                    {student.program} · {student.group}
                  </p>
                </div>
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ml-3 flex-shrink-0"
                  style={
                    student.status === 'Activo'
                      ? { background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }
                      : student.status === 'Pendiente'
                      ? { background: '#fef3c7', color: '#d97706', borderColor: '#fde68a' }
                      : { background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }
                  }
                >
                  {student.status}
                </span>
              </div>
            ))}
            {teacherStudents.length > 5 && (
              <p className="text-xs text-center pt-2" style={{ color: '#94a3b8' }}>
                +{teacherStudents.length - 5} estudiantes más
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      <Modal
        isOpen={isEditing}
        onClose={closeEdit}
        title="Editar perfil"
        maxWidth="md"
      >
        <div className="space-y-4">
          {formError && (
            <div className="px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(248,113,113,0.08)', color: '#ef4444', border: '1px solid rgba(248,113,113,0.2)' }}>
              {formError}
            </div>
          )}
          <Input
            label="Nombre completo"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Correo electrónico"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <Input
            label="Teléfono"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <Input
            label="Ciudad"
            value={editForm.city}
            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeEdit}>
              Cancelar
            </Button>
            <Button type="button" isLoading={isSaving} onClick={handleSave}>
              Guardar cambios
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
