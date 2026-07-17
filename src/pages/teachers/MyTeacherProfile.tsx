import { useEffect, useState, useMemo } from 'react';
import {
  GraduationCap, Mail, Phone, MapPin, Calendar, Loader2, Pencil, Users, Clock, Book, User,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useStudentStore from '../../store/studentStore';
import type { Teacher } from '../../types/teacher.types';
import { getTeacherByIdRequest, updateTeacherRequest } from '../../services/teacherService';
import { getErrorMessage } from '../../utils/errorMessage';
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
      const message = getErrorMessage(err, 'No se pudo actualizar el perfil');
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] text-slate-400">
        <Loader2 size={28} className="animate-spin mb-3 text-purple-600" />
        <p className="text-sm font-medium">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center max-w-lg border border-slate-100">
        <GraduationCap size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
        <p className="font-semibold text-slate-900">{error ?? 'Perfil no encontrado'}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-slate-900">
            <GraduationCap size={24} className="text-purple-600" />
            Mi perfil docente
          </h1>
          <p className="text-sm mt-1 text-slate-500">
            Datos del docente vinculados a tu cuenta.
          </p>
        </div>
        <Button leftIcon={<Pencil size={16} />} onClick={openEdit}>
          Editar perfil
        </Button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
        <div
          className="px-6 py-8 flex flex-col sm:flex-row sm:items-center gap-5"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(37,99,235,0.06))',
          }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0 bg-gradient-to-br from-purple-600 to-blue-600">
            {teacher.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {teacher.name}
              </h2>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  teacher.status === 'Activo'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                {teacher.status}
              </span>
            </div>
            <p className="text-sm mt-1 text-slate-500">
              Rol: Docente · WorkFlow Academy
            </p>
          </div>
        </div>

        <div className="p-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contacto
            </h3>
            <p className="flex items-center gap-2 text-sm text-slate-700">
              <Mail size={15} className="text-purple-600" /> {teacher.email}
            </p>
            <p className="flex items-center gap-2 text-sm text-slate-700">
              <Phone size={15} className="text-purple-600" /> {teacher.phone}
            </p>
            <p className="flex items-center gap-2 text-sm text-slate-700">
              <MapPin size={15} className="text-purple-600" /> {teacher.city}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Especialidades
            </h3>
            <div className="flex flex-wrap gap-2">
              {teacher.specialties.map((s) => (
                <span
                  key={s}
                  className="text-xs font-semibold px-3 py-1 rounded-full border bg-purple-50 text-purple-600 border-purple-200"
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="flex items-center gap-2 text-xs pt-2 text-slate-400">
              <Calendar size={13} /> Actualizado {formatDate(teacher.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas del docente */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
          <Users size={20} className="mx-auto mb-2 text-purple-600" />
          <p className="text-2xl font-extrabold text-slate-900">{teacherStudents.length}</p>
          <p className="text-xs font-medium mt-1 text-slate-500">Alumnos</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
          <Clock size={20} className="mx-auto mb-2 text-purple-600" />
          <p className="text-2xl font-extrabold text-slate-900">{totalSessions}</p>
          <p className="text-xs font-medium mt-1 text-slate-500">Sesiones</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
          <GraduationCap size={20} className="mx-auto mb-2 text-purple-600" />
          <p className="text-2xl font-extrabold text-slate-900">{teacher.specialties.length}</p>
          <p className="text-xs font-medium mt-1 text-slate-500">Especialidades</p>
        </div>
      </div>

      {/* Cursos asignados al docente */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-slate-400">
          <Book size={14} className="text-purple-600" />
          Mis cursos
        </h3>
        {teacherPrograms.length === 0 ? (
          <p className="text-sm text-center py-4 text-slate-400">
            No tienes cursos asignados
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {teacherPrograms.map((program) => (
              <span
                key={program}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-purple-50 text-purple-600 border-purple-200"
              >
                {program}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Mis estudiantes */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-slate-400">
          <User size={14} className="text-purple-600" />
          Mis estudiantes
        </h3>
        {teacherStudents.length === 0 ? (
          <p className="text-sm text-center py-4 text-slate-400">
            No tienes estudiantes asignados
          </p>
        ) : (
          <div className="space-y-3">
            {teacherStudents.slice(0, 5).map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-slate-900">
                    {student.name}
                  </p>
                  <p className="text-xs mt-1 text-slate-500">
                    {student.program} · {student.group}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ml-3 flex-shrink-0 ${
                    student.status === 'Activo'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : student.status === 'Pendiente'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  {student.status}
                </span>
              </div>
            ))}
            {teacherStudents.length > 5 && (
              <p className="text-xs text-center pt-2 text-slate-400">
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
