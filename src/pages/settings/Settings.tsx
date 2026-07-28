import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Bell, Building2, Save, Eye, EyeOff, Camera, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useAuthStore from '../../store/authStore';
import { updateProfileRequest, changePasswordRequest } from '../../services/authService';
import { useNotifications } from '../../hooks/useNotifications';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';
import { LazyImage } from '../../components/common';
import { changePasswordSchema, profileSchema } from '../../schemas/auth.schema';
import { getErrorMessage } from '../../utils/errorMessage';

interface ProfileForm { name: string; email: string; phone: string; city: string; }
interface PasswordForm { current: string; newPass: string; confirm: string; }
interface OrgInfo { name: string; website: string; plan: string; country: string; supportEmail: string; }

const TABS = [
  { id:'profile',  icon: User,      label:'Mi Perfil'       },
  { id:'security', icon: Lock,      label:'Seguridad'       },
  { id:'notif',    icon: Bell,      label:'Notificaciones'  },
  { id:'org',      icon: Building2, label:'Organización'    },
];

export const Settings = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [tab,     setTab]     = useState('profile');
  
  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving,    setIsSaving]    = useState(false);
  const [isSavingPwd, setIsSavingPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [orgInfo, setOrgInfo] = useState<OrgInfo>({
    name: 'WorkFlow Academy',
    website: 'www.workflowacademy.co',
    plan: 'Enterprise',
    country: 'Colombia',
    supportEmail: 'soporte@workflowacademy.co',
  });

  const { register: regP, handleSubmit: hsP, formState: { errors: errP }, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      city: user?.city ?? 'Bogotá, Colombia',
    },
  });
  const { register: regS, handleSubmit: hsS, formState: { errors: errS }, watch, reset: resetPwd } = useForm<PasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  // ── Notificaciones: hook con auto-save ──
  const { prefs: notifs, toggle: toggleNotif, saveAll: saveAllNotifs, syncStatus } = useNotifications();

  // ── Avatar upload ──
  const { avatarUrl, isUploading, uploadError, inputRef, openFilePicker, handleFileChange } = useAvatarUpload();

  useEffect(() => {
    const storedOrg = localStorage.getItem('wf_org');
    if (storedOrg) {
      try { setOrgInfo(JSON.parse(storedOrg)); } catch {
        // valor persistido corrupto: ignoramos y mantenemos el default
      }
    }
  }, []);

  useEffect(() => {
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      city: user?.city ?? 'Bogotá, Colombia',
    });
  }, [user, reset]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const onSaveProfile = async (data: ProfileForm) => {
    setIsSaving(true);
    try {
      const updatedUser = await updateProfileRequest(data);
      if (user) {
        setUser({ ...user, ...updatedUser });
      }
      showToast('Cambios guardados correctamente', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Error de red al conectar con el servidor'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const onSaveSecurity = async (data: PasswordForm) => {
    setIsSavingPwd(true);
    try {
      await changePasswordRequest({
        currentPassword: data.current,
        newPassword:     data.newPass,
      });
      showToast('Contraseña actualizada correctamente', 'success');
      resetPwd();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error de red al cambiar la contraseña'), 'error');
    } finally {
      setIsSavingPwd(false);
    }
  };

  const onSaveNotifications = async () => {
    await saveAllNotifs();
  };

  const onSaveOrganization = () => {
    localStorage.setItem('wf_org', JSON.stringify(orgInfo));
    showToast('Organización guardada correctamente', 'success');
  };

  const updateOrgField = (field: keyof OrgInfo, value: string) => {
    setOrgInfo((prev) => ({ ...prev, [field]: value }));
  };

  const inputCls = () =>
    `w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all`;
  const inputSt  = (err?: boolean) => ({ borderColor: err ? '#f87171' : '#e2e8f0', color:'#0f172a' });

  return (
    <div className="w-full space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color:'#0f172a' }}>
          <SettingsIcon size={24} style={{ color:'#7c3aed' }} /> Configuración
        </h1>
        <p className="text-sm mt-1" style={{ color:'#64748b' }}>Gestiona tu perfil, seguridad y preferencias.</p>
      </div>

      {/* Toast guardado */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-300"
          style={{
            background: toast.type === 'success'
              ? 'linear-gradient(135deg,#10b981,#059669)'
              : 'linear-gradient(135deg,#ef4444,#dc2626)',
            border: toast.type === 'success'
              ? '1px solid rgba(16,185,129,0.2)'
              : '1px solid rgba(239,68,68,0.2)'
          }}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      <div className="flex gap-6">
        {/* Tabs laterales */}
        <aside className="w-48 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all w-full ${
                  tab === t.id ? 'text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                style={tab === t.id ? { background:'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(37,99,235,0.08))', border:'1px solid rgba(124,58,237,0.25)', color:'#7c3aed' } : {}}>
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Panel derecho */}
        <div className="flex-1 bg-white rounded-2xl p-6" style={{ border:'1px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>

          {/* ── PERFIL ── */}
          {tab === 'profile' && (
            <form onSubmit={hsP(onSaveProfile)} className="space-y-5">
              <h2 className="text-base font-bold" style={{ color:'#0f172a' }}>Información Personal</h2>

              {/* Avatar con upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarUrl ? (
                    <LazyImage
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-16 h-16 rounded-2xl"
                      bgColor="transparent"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold"
                      style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                      {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                      style={{ background:'rgba(0,0,0,0.5)' }}>
                      <Loader size={16} className="text-white animate-spin" />
                    </div>
                  )}
                  <button type="button" onClick={openFilePicker} disabled={isUploading}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}
                    title="Cambiar foto de perfil">
                    <Camera size={12} />
                  </button>
                  <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange} className="hidden" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color:'#0f172a' }}>{user?.name}</p>
                  <p className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>{user?.role === 'ADMIN' ? 'Administrador' : user?.role ?? 'Sin rol'} · WorkFlow Academy</p>
                  {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color:'#334155' }}>Nombre completo</label>
                  <input className={inputCls()} style={inputSt(!!errP.name)}
                    {...regP('name', { required:'Obligatorio' })} />
                  {errP.name && <p className="text-xs text-red-500">{errP.name.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color:'#334155' }}>Correo electrónico</label>
                  <input type="email" className={inputCls()} style={inputSt(!!errP.email)}
                    {...regP('email', { required:'Obligatorio' })} />
                  {errP.email && <p className="text-xs text-red-500">{errP.email.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color:'#334155' }}>Teléfono</label>
                  <input placeholder="+57 300 000 0000" className={inputCls()} style={inputSt()}
                    {...regP('phone')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color:'#334155' }}>Ciudad</label>
                  <input className={inputCls()} style={inputSt()} {...regP('city')} />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white animate-infinite" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} /> Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ── SEGURIDAD ── */}
          {tab === 'security' && (
            <form onSubmit={hsS(onSaveSecurity)} className="space-y-5">
              <h2 className="text-base font-bold" style={{ color:'#0f172a' }}>Cambiar Contraseña</h2>

              {[
                { name:'current' as const, label:'Contraseña actual',    rules:{ required:'Obligatorio' } },
                { name:'newPass' as const, label:'Nueva contraseña',     rules:{ required:'Obligatorio', minLength:{ value:6, message:'Mínimo 6 caracteres' } } },
                { name:'confirm' as const, label:'Confirmar contraseña', rules:{ required:'Obligatorio', validate:(v: string) => v === watch('newPass') || 'Las contraseñas no coinciden' } },
              ].map((f) => (
                <div key={f.name} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color:'#334155' }}>{f.label}</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                      className={inputCls()} style={inputSt(!!errS[f.name])}
                      {...regS(f.name, f.rules)} />
                    {f.name === 'newPass' && (
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                        {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                  {errS[f.name] && <p className="text-xs text-red-500">{errS[f.name]?.message}</p>}
                </div>
              ))}

              <div className="flex justify-end">
                <button type="submit" disabled={isSavingPwd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  {isSavingPwd ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <><Save size={15} /> Actualizar contraseña</>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ── NOTIFICACIONES ── */}
          {tab === 'notif' && (
            <div className="space-y-5">
              {/* Header con indicador de estado de sincronización */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold" style={{ color:'#0f172a' }}>Preferencias de Notificaciones</h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-300"
                  style={{
                    background: syncStatus === 'saved'  ? 'rgba(16,185,129,0.1)'  :
                                syncStatus === 'saving' ? 'rgba(124,58,237,0.1)'  :
                                syncStatus === 'error'  ? 'rgba(239,68,68,0.1)'   : 'rgba(148,163,184,0.1)',
                    color:      syncStatus === 'saved'  ? '#10b981' :
                                syncStatus === 'saving' ? '#7c3aed' :
                                syncStatus === 'error'  ? '#ef4444' : '#94a3b8',
                    border:     syncStatus === 'saved'  ? '1px solid rgba(16,185,129,0.25)'  :
                                syncStatus === 'saving' ? '1px solid rgba(124,58,237,0.25)'  :
                                syncStatus === 'error'  ? '1px solid rgba(239,68,68,0.25)'   : '1px solid rgba(148,163,184,0.25)',
                  }}>
                  {syncStatus === 'saving' && (
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  )}
                  {syncStatus === 'saved'  && '✓'}
                  {syncStatus === 'error'  && '✗'}
                  {syncStatus === 'idle'   && '●'}
                  {syncStatus === 'saving' ? 'Guardando...' :
                   syncStatus === 'saved'  ? 'Guardado' :
                   syncStatus === 'error'  ? 'Error al guardar' : 'Auto-guardado activo'}
                </span>
              </div>

              <p className="text-xs" style={{ color:'#94a3b8' }}>
                Los cambios se guardan automáticamente al activar o desactivar cada opción.
              </p>

              <div className="space-y-3">
                {[
                  { key:'sesiones'  as const, label:'Sesiones completadas',        desc:'Cuando un alumno completa una sesión'    },
                  { key:'programas' as const, label:'Actualizaciones de programas', desc:'Cambios en cursos y módulos'            },
                  { key:'alumnos'   as const, label:'Nuevas inscripciones',         desc:'Cuando un alumno se registra'           },
                  { key:'reportes'  as const, label:'Reportes semanales',           desc:'Resumen de actividad cada semana'       },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between p-4 rounded-xl transition-all duration-200"
                    style={{ background:'#f8fafc', border:'1px solid #f1f5f9' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color:'#0f172a' }}>{n.label}</p>
                      <p className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>{n.desc}</p>
                    </div>
                    {/* Toggle — cada click auto-guarda */}
                    <button
                      onClick={() => toggleNotif(n.key)}
                      className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-1"
                      style={{ background: notifs[n.key] ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : '#e2e8f0' }}
                      aria-label={`${notifs[n.key] ? 'Desactivar' : 'Activar'} ${n.label}`}
                      aria-pressed={notifs[n.key]}>
                      <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
                        style={{ left: notifs[n.key] ? '24px' : '4px' }} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Botón de guardado explícito (sincroniza con API) */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs" style={{ color:'#94a3b8' }}>
                  Las preferencias persisten al refrescar la página.
                </p>
                <button onClick={onSaveNotifications} disabled={syncStatus === 'saving'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  <Save size={15} /> Sincronizar
                </button>
              </div>
            </div>
          )}

          {/* ── ORGANIZACIÓN ── */}
          {tab === 'org' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold" style={{ color:'#0f172a' }}>Información de la Organización</h2>
                {/* Badge de rol */}
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: user?.role === 'ADMIN' ? 'rgba(124,58,237,0.1)' : 'rgba(148,163,184,0.1)',
                    border:     user?.role === 'ADMIN' ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(148,163,184,0.3)',
                    color:      user?.role === 'ADMIN' ? '#7c3aed' : '#94a3b8',
                  }}>
                  {user?.role === 'ADMIN' ? '🔓 Admin — Edición habilitada' : '🔒 Solo lectura'}
                </span>
              </div>

              {/* Aviso si no es admin */}
              {user?.role !== 'ADMIN' && (
                <div className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)' }}>
                  <span className="text-red-400 flex-shrink-0 mt-0.5">⚠️</span>
                  <p className="text-xs text-red-500 font-medium leading-relaxed">
                    No tienes permisos para editar los datos de la organización.
                    Solo los administradores pueden modificar esta información.
                    Contacta a tu administrador para realizar cambios.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {([
                  { label:'Nombre de la organización', field:'name'         as const, placeholder:'WorkFlow Academy'           },
                  { label:'Sitio web',                  field:'website'      as const, placeholder:'www.workflowacademy.co'     },
                  { label:'Plan activo',                field:'plan'         as const, placeholder:'Enterprise'                },
                  { label:'País',                       field:'country'      as const, placeholder:'Colombia'                  },
                  { label:'Email de soporte',           field:'supportEmail' as const, placeholder:'soporte@workflowacademy.co' },
                ] as const).map((f) => (
                  <div key={f.label} className={`flex flex-col gap-1.5 ${f.field === 'supportEmail' ? 'col-span-2' : ''}`}>
                    <label className="text-sm font-medium" style={{ color: user?.role === 'ADMIN' ? '#334155' : '#94a3b8' }}>
                      {f.label}
                    </label>
                    <input
                      value={orgInfo[f.field]}
                      onChange={(e) => user?.role === 'ADMIN' && updateOrgField(f.field, e.target.value)}
                      placeholder={f.placeholder}
                      disabled={user?.role !== 'ADMIN'}
                      className={inputCls()}
                      style={{
                        borderColor: '#e2e8f0',
                        color: user?.role === 'ADMIN' ? '#0f172a' : '#94a3b8',
                        background: user?.role !== 'ADMIN' ? '#f8fafc' : '#fff',
                        cursor: user?.role !== 'ADMIN' ? 'not-allowed' : 'text',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Info de plan */}
              <div className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background:'rgba(124,58,237,0.05)', border:'1px solid rgba(124,58,237,0.15)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(124,58,237,0.12)' }}>
                  <Building2 size={16} style={{ color:'#7c3aed' }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color:'#7c3aed' }}>Plan {orgInfo.plan}</p>
                  <p className="text-[11px] mt-0.5" style={{ color:'#94a3b8' }}>
                    Para cambiar de plan contacta a soporte: {orgInfo.supportEmail}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onSaveOrganization}
                  disabled={user?.role !== 'ADMIN'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}
                  title={user?.role !== 'ADMIN' ? 'Solo administradores pueden guardar cambios' : 'Guardar cambios'}>
                  <Save size={15} /> Guardar organización
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
