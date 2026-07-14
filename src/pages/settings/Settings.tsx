import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Bell, Building2, Save, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/authStore';

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
  const [saved,   setSaved]   = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [orgInfo, setOrgInfo] = useState<OrgInfo>({
    name: 'WorkFlow Academy',
    website: 'www.workflowacademy.co',
    plan: 'Enterprise',
    country: 'Colombia',
    supportEmail: 'soporte@workflowacademy.co',
  });

  const { register: regP, handleSubmit: hsP, formState: { errors: errP }, reset } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      city: user?.city ?? 'Bogotá, Colombia',
    },
  });
  const { register: regS, handleSubmit: hsS, formState: { errors: errS }, watch } = useForm<PasswordForm>();

  const [notifs, setNotifs] = useState({
    sesiones:  true,
    programas: true,
    alumnos:   false,
    reportes:  false,
  });

  useEffect(() => {
    const storedNotifs = localStorage.getItem('wf_notifs');
    const storedOrg = localStorage.getItem('wf_org');
    if (storedNotifs) {
      try { setNotifs(JSON.parse(storedNotifs)); } catch {};
    }
    if (storedOrg) {
      try { setOrgInfo(JSON.parse(storedOrg)); } catch {};
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

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const onSaveProfile = (data: ProfileForm) => {
    if (user) {
      setUser({ ...user, ...data });
    }
    showSaved();
  };

  const onSaveSecurity = (data: PasswordForm) => {
    console.log('Cambiar contraseña frontend:', data);
    showSaved();
  };

  const onSaveNotifications = () => {
    localStorage.setItem('wf_notifs', JSON.stringify(notifs));
    showSaved();
  };

  const onSaveOrganization = () => {
    localStorage.setItem('wf_org', JSON.stringify(orgInfo));
    showSaved();
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
      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-lg"
          style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
          ✓ Cambios guardados correctamente
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

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  {user?.name?.charAt(0) ?? 'A'}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color:'#0f172a' }}>{user?.name}</p>
                  <p className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>Administrador · WorkFlow Academy</p>
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
                <button type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  <Save size={15} /> Guardar cambios
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
                <button type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  <Save size={15} /> Actualizar contraseña
                </button>
              </div>
            </form>
          )}

          {/* ── NOTIFICACIONES ── */}
          {tab === 'notif' && (
            <div className="space-y-5">
              <h2 className="text-base font-bold" style={{ color:'#0f172a' }}>Preferencias de Notificaciones</h2>
              <div className="space-y-3">
                {[
                  { key:'sesiones'  as const, label:'Sesiones completadas',        desc:'Cuando un alumno completa una sesión'    },
                  { key:'programas' as const, label:'Actualizaciones de programas', desc:'Cambios en cursos y módulos'            },
                  { key:'alumnos'   as const, label:'Nuevas inscripciones',         desc:'Cuando un alumno se registra'           },
                  { key:'reportes'  as const, label:'Reportes semanales',           desc:'Resumen de actividad cada semana'       },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background:'#f8fafc', border:'1px solid #f1f5f9' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color:'#0f172a' }}>{n.label}</p>
                      <p className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>{n.desc}</p>
                    </div>
                    <button onClick={() => setNotifs((p) => ({ ...p, [n.key]: !p[n.key] }))}
                      className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                      style={{ background: notifs[n.key] ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : '#e2e8f0' }}>
                      <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
                        style={{ left: notifs[n.key] ? '24px' : '4px' }} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={onSaveNotifications}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  <Save size={15} /> Guardar preferencias
                </button>
              </div>
            </div>
          )}

          {/* ── ORGANIZACIÓN ── */}
          {tab === 'org' && (
            <div className="space-y-5">
              <h2 className="text-base font-bold" style={{ color:'#0f172a' }}>Información de la Organización</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label:'Nombre',   field:'name' as const },
                  { label:'Website',  field:'website' as const },
                  { label:'Plan',     field:'plan' as const },
                  { label:'País',     field:'country' as const },
                  { label:'Email de soporte', field:'supportEmail' as const },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" style={{ color:'#334155' }}>{f.label}</label>
                    <input value={orgInfo[f.field]} onChange={(e) => updateOrgField(f.field, e.target.value)} className={inputCls()} style={inputSt()} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={onSaveOrganization}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  <Save size={15} /> Guardar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
