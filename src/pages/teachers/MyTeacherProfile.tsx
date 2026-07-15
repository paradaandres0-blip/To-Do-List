import { useEffect, useState } from 'react';
import {
  GraduationCap, Mail, Phone, MapPin, Calendar, Loader2,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import type { Teacher } from '../../types/teacher.types';
import { getTeacherByIdRequest } from '../../services/teacherService';

/** Perfil del docente autenticado (misma paleta del dashboard). */
export const MyTeacherProfile = () => {
  const user = useAuthStore((s) => s.user);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    </div>
  );
};
