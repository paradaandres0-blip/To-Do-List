import { User, Mail, Phone, MapPin, Shield, Camera, Loader } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';
import { LazyImage } from '../../components/common';

const ACTIVITY = [
  { action: 'Aprobó sesión "Rutina de Fuerza Nivel 2"',  time: 'Hace 2 horas'  },
  { action: 'Creó programa "Nutrición Deportiva Pro"',   time: 'Hace 5 horas'  },
  { action: 'Asignó grupo "Cohorte Fitness 2026"',       time: 'Hace 1 día'    },
  { action: 'Actualizó módulo "Mindfulness Avanzado"',   time: 'Hace 2 días'   },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Super Admin',
  instructor: 'Instructor',
  student: 'Estudiante',
};

export const Profile = () => {
  const user = useAuthStore((s) => s.user);
  const { avatarUrl, isUploading, uploadError, inputRef, openFilePicker, handleFileChange } = useAvatarUpload();

  const initials = user?.name?.charAt(0)?.toUpperCase() ?? 'A';

  return (
    <div className="w-full space-y-6 max-w-4xl">

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: '#0f172a' }}>
          <User size={24} style={{ color: '#7c3aed' }} />
          Mi Perfil
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
          Gestiona tu información personal y preferencias de cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tarjeta de perfil */}
        <div
          className="bg-white rounded-2xl p-6 flex flex-col items-center text-center"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          {/* Avatar con botón de cámara */}
          <div className="relative mb-4">
            {avatarUrl ? (
              <LazyImage
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-2xl"
                bgColor="transparent"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
              >
                {initials}
              </div>
            )}

            {/* Overlay de carga */}
            {isUploading && (
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
                <Loader size={20} className="text-white animate-spin" />
              </div>
            )}

            {/* Botón cámara */}
            <button
              onClick={openFilePicker}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
              title="Cambiar foto de perfil"
            >
              <Camera size={14} />
            </button>

            {/* Input oculto */}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Error de upload */}
          {uploadError && (
            <p className="text-xs text-red-500 mb-2 max-w-[200px]">{uploadError}</p>
          )}

          <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>{user?.name ?? 'Usuario'}</h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            {user?.role ? ROLE_LABELS[user.role] ?? user.role : 'Sin rol'}
          </p>

          {/* Badge rol */}
          <span
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <Shield size={11} /> {user?.role ? ROLE_LABELS[user.role] ?? user.role : 'Sin rol'}
          </span>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 w-full mt-6 pt-6" style={{ borderTop: '1px solid #f1f5f9' }}>
            {[
              { label: 'Cursos',    value: '12' },
              { label: 'Grupos',    value: '4'  },
              { label: 'Tareas',    value: '48' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-extrabold" style={{ color: '#0f172a' }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Información + Actividad */}
        <div className="lg:col-span-2 space-y-5">

          {/* Datos personales */}
          <div
            className="bg-white rounded-2xl p-6"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold" style={{ color: '#0f172a' }}>Información Personal</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User,    label: 'Nombre completo', value: user?.name  ?? '—' },
                { icon: Mail,    label: 'Correo',          value: user?.email ?? '—' },
                { icon: Phone,   label: 'Teléfono',        value: user?.phone ?? '—' },
                { icon: MapPin,  label: 'Ciudad',          value: user?.city  ?? '—' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(124,58,237,0.08)' }}
                  >
                    <item.icon size={15} style={{ color: '#7c3aed' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>{item.label}</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: '#0f172a' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad reciente */}
          <div
            className="bg-white rounded-2xl p-6"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <h3 className="font-bold mb-5" style={{ color: '#0f172a' }}>Actividad Reciente</h3>
            <div className="space-y-4">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
                  />
                  <p className="text-sm flex-1" style={{ color: '#334155' }}>{a.action}</p>
                  <span className="text-xs flex-shrink-0" style={{ color: '#94a3b8' }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

