import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  GraduationCap, ArrowLeft, Mail, Phone, MapPin,
  Calendar, Pencil, Loader2, Users,
} from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import type { Teacher } from '../../types/teacher.types';
import { getTeacherByIdRequest } from '../../services/teacherService';
import useStudentStore from '../../store/studentStore';

/**
 * Vista de perfil de docente.
 * Hoy consume el mock/API GET /teachers/:id.
 * Cuando exista PostgreSQL, el mismo endpoint devolverá la fila de `teachers`.
 */
export const TeacherProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getByTeacherId } = useStudentStore();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTeacherByIdRequest(id);
        setTeacher(data);
      } catch {
        setError('No se encontró el perfil del docente');
        setTeacher(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px]" style={{ color: '#94a3b8' }}>
        <Loader2 size={28} className="animate-spin mb-3" style={{ color: '#7c3aed' }} />
        <p className="text-sm font-medium">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/teachers')}
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: '#64748b' }}
        >
          <ArrowLeft size={14} /> Volver a docentes
        </button>
        <div className="bg-white rounded-2xl p-10 text-center"
          style={{ border: '1px solid #f1f5f9' }}>
          <GraduationCap size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#94a3b8' }} />
          <p className="font-semibold" style={{ color: '#0f172a' }}>{error ?? 'Docente no encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-3xl">
      <button
        type="button"
        onClick={() => navigate('/teachers')}
        className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
        style={{ color: '#64748b' }}
      >
        <ArrowLeft size={14} /> Volver a docentes
      </button>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {/* Cabecera del perfil */}
        <div
          className="px-6 py-8 flex flex-col sm:flex-row sm:items-center gap-5"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(37,99,235,0.06))' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
          >
            {teacher.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>
                {teacher.name}
              </h1>
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
            <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: '#64748b' }}>
              <GraduationCap size={14} /> Perfil de docente
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Pencil size={14} />}
            onClick={() => navigate('/teachers')}
          >
            Editar en listado
          </Button>
        </div>

        <div className="p-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
              Contacto
            </h2>
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
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
              Especialidades
            </h2>
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
              <Calendar size={13} />
              Creado {formatDate(teacher.createdAt)}
            </p>
            <p className="flex items-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
              <Calendar size={13} />
              Actualizado {formatDate(teacher.updatedAt)}
            </p>
          </div>
        </div>

        {/* Estudiantes asignados */}
        <div className="px-6 pb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>
            Estudiantes Asignados
          </h2>
          {(() => {
            const assignedStudents = id ? getByTeacherId(id) : [];
            if (assignedStudents.length === 0) {
              return (
                <div className="text-center py-8" style={{ color: '#94a3b8' }}>
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin estudiantes asignados</p>
                </div>
              );
            }
            return (
              <div className="space-y-2">
                {assignedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
                      >
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{student.name}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>{student.program} • {student.group}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
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
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
