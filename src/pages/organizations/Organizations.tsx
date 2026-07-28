import { useEffect, useMemo, useState } from 'react';
import { Building2, Plus, Search, Users, BookOpen, Globe, Trash2, Pencil, Eye, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Modal } from '../../components/common/Modal/Modal';
import { createCenterRequest, deleteCenterRequest, getCentersRequest, updateCenterRequest } from '../../services/centerService';
import { getGroupsRequest } from '../../services/groupService';
import { getStudentsRequest } from '../../services/studentService';
import type { Center } from '../../types/center.types';
import type { Group } from '../../types/group.types';
import type { Student } from '../../types/student.types';

const planStyle: Record<Center['plan'], string> = {
  Enterprise: 'bg-purple-50 text-purple-700 border-purple-200',
  Pro: 'bg-blue-50 text-blue-700 border-blue-200',
  Básico: 'bg-slate-50 text-slate-500 border-slate-200',
};

const groupLimitForPlan = (plan: Center['plan']): number => {
  if (plan === 'Básico') return 2;
  if (plan === 'Pro') return 6;
  return Number.MAX_SAFE_INTEGER;
};

interface Organization extends Center {
  groups: number;
  students: number;
  assignedGroups: string[];
}

interface OrgForm { name: string; website: string; plan: Center['plan']; }

export const Organizations = () => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Center | null>(null);
  const [detailOrg, setDetailOrg] = useState<Organization | null>(null);
  const [actionTarget, setActionTarget] = useState<{ id: string; type: 'deactivate' | 'delete' } | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrgForm>();

  const orgs = useMemo<Organization[]>(() => {
    return (centers ?? []).map((center) => {
      const assignedGroups = (groups ?? []).filter((group) => group.centerId === center.id).map((group) => group.name);
      const studentCount = (students ?? []).filter((student) => assignedGroups.includes(student.group)).length;
      return {
        ...center,
        groups: assignedGroups.length,
        students: studentCount,
        assignedGroups,
      };
    });
  }, [centers, groups, students]);

  const filtered = useMemo(() => orgs.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.website.toLowerCase().includes(search.toLowerCase()),
  ), [orgs, search]);

  const loadData = async () => {
    try {
      const [centersResponse, groupsResponse, studentsResponse] = await Promise.all([
        getCentersRequest(),
        getGroupsRequest(),
        getStudentsRequest(1, 1000),
      ]);

      setCenters(centersResponse ?? []);
      setGroups(groupsResponse ?? []);

      const studentData = Array.isArray(studentsResponse)
        ? studentsResponse
        : studentsResponse?.data ?? [];
      setStudents(studentData);
    } catch (error) {
      console.error('Error cargando datos de centros, grupos o alumnos:', error);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const refresh = async () => {
    await loadData();
  };

  const onSubmit = async (data: OrgForm) => {
    try {
      if (editingOrg) {
        await updateCenterRequest(editingOrg.id, { name: data.name, website: data.website, plan: data.plan });
      } else {
        await createCenterRequest({ name: data.name, website: data.website, plan: data.plan, active: true });
      }
      await refresh();
      setIsOpen(false);
      setEditingOrg(null);
      reset();
    } catch (error) {
      console.error('Error guardando centro:', error);
      alert('No se pudo guardar el centro. Intenta de nuevo.');
    }
  };

  const openCreate = () => { setEditingOrg(null); reset({ plan: 'Básico' }); setIsOpen(true); };
  const openEdit = (org: Organization) => {
    setEditingOrg(org);
    reset({ name: org.name, website: org.website, plan: org.plan });
    setIsOpen(true);
  };

  const openDetails = (org: Organization) => setDetailOrg(org);

  const toggleActive = async (id: string) => {
    const center = centers.find((c) => c.id === id);
    if (!center) return;
    try {
      await updateCenterRequest(id, { active: !center.active });
      await refresh();
      if (detailOrg?.id === id) {
        setDetailOrg({ ...detailOrg, active: !detailOrg.active });
      }
    } catch (error) {
      console.error('Error actualizando estado del centro:', error);
      alert('No se pudo actualizar el estado del centro.');
    }
  };

  const canAddGroupToCenter = (centerId: string) => {
    const center = centers.find((c) => c.id === centerId);
    if (!center) return false;
    return groups.filter((group) => group.centerId === centerId).length < groupLimitForPlan(center.plan);
  };

  const confirmAction = async () => {
    if (!actionTarget) return;
    if (actionTarget.type === 'delete' && adminPassword !== '123456') {
      alert('La contraseña de administrador no es correcta.');
      return;
    }

    try {
      if (actionTarget.type === 'delete') {
        await deleteCenterRequest(actionTarget.id);
        if (detailOrg?.id === actionTarget.id) setDetailOrg(null);
      } else {
        await updateCenterRequest(actionTarget.id, { active: false });
      }
      await refresh();
    } catch (error) {
      console.error('Error ejecutando acción de centro:', error);
      alert('No se pudo completar la acción.');
    } finally {
      setActionTarget(null);
      setAdminPassword('');
    }
  };

  const handleDelete = (id: string) => {
    setActionTarget({ id, type: 'delete' });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: '#0f172a' }}>
            <Building2 size={24} style={{ color: '#7c3aed' }} />
            Centros y Organizaciones
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Gestiona los centros de salud y sus accesos a la plataforma.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
        >
          <Plus size={16} /> Nuevo Centro
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Centros', value: orgs.length, color: '#7c3aed' },
          { label: 'Activos', value: orgs.filter((o) => o.active).length, color: '#059669' },
          { label: 'Total Grupos', value: orgs.reduce((a, o) => a + o.groups, 0), color: '#2563eb' },
          { label: 'Alumnos', value: orgs.reduce((a, o) => a + o.students, 0), color: '#d97706' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 text-center"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#94a3b8' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" placeholder="Buscar centro u organización..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
            style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
          />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden bg-white"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              {['Centro / Organización', 'Plan', 'Grupos', 'Alumnos', 'Estado', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((org, i) => (
              <tr key={org.id} className="hover:bg-slate-50 transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                      {org.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#0f172a' }}>{org.name}</p>
                      <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#94a3b8' }}>
                        <Globe size={11} /> {org.website}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${planStyle[org.plan]}`}>
                    {org.plan}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#475569' }}>
                    <BookOpen size={13} style={{ color: '#94a3b8' }} /> {org.groups}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#475569' }}>
                    <Users size={13} style={{ color: '#94a3b8' }} /> {org.students}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    org.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {org.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openDetails(org)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openEdit(org)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                      title="Editar centro"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => toggleActive(org.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        org.active ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {org.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(org.id)}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar centro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center" style={{ color: '#94a3b8' }}>
            <Building2 size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No se encontraron centros</p>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setEditingOrg(null); reset(); }} title={editingOrg ? 'Editar Centro' : 'Nuevo Centro'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {([
            { name: 'name' as const, label: 'Nombre', placeholder: 'Ej. Centro FitLife' },
            { name: 'website' as const, label: 'Sitio web', placeholder: 'www.ejemplo.com' },
          ] as const).map((f) => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: '#334155' }}>{f.label}</label>
              <input placeholder={f.placeholder}
                className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                style={{ borderColor: errors[f.name] ? '#f87171' : '#e2e8f0', color: '#0f172a' }}
                {...register(f.name, { required: `${f.label} es obligatorio` })}
              />
              {errors[f.name] && <p className="text-xs text-red-500">{errors[f.name]?.message}</p>}
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: '#334155' }}>Plan</label>
            <select className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
              {...register('plan', { required: 'Selecciona un plan' })}>
              <option value="">Seleccionar...</option>
              <option>Básico</option>
              <option>Pro</option>
              <option>Enterprise</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setIsOpen(false); setEditingOrg(null); reset(); }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-100"
              style={{ border: '1px solid #e2e8f0', color: '#475569' }}>
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
              {editingOrg ? 'Guardar cambios' : 'Crear Centro'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!detailOrg} onClose={() => setDetailOrg(null)} title="Detalle del Centro" maxWidth="lg">
        {detailOrg && (
          <div className="space-y-5 text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Centro</p>
                <p className="text-base font-semibold text-slate-900">{detailOrg.name}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Sitio web</p>
                <p className="text-base font-semibold text-slate-900">{detailOrg.website}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Plan</p>
                <p className="text-base font-semibold text-slate-900">{detailOrg.plan}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Estado</p>
                <p className="text-base font-semibold text-slate-900">{detailOrg.active ? 'Activo' : 'Inactivo'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Grupos</p>
                <p className="text-xl font-bold text-slate-900">{detailOrg.groups}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Alumnos</p>
                <p className="text-xl font-bold text-slate-900">{detailOrg.students}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Acción</p>
                <button
                  onClick={() => {
                    if (detailOrg) {
                      toggleActive(detailOrg.id);
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    detailOrg.active ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {detailOrg.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-900">Grupos asignados</p>
                <span className="text-xs text-slate-500">{detailOrg.assignedGroups.length}/{groupLimitForPlan(detailOrg.plan)} grupos</span>
              </div>
              <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                  <p>
                    El plan {detailOrg.plan} permite hasta {groupLimitForPlan(detailOrg.plan) === Number.MAX_SAFE_INTEGER ? 'grupos ilimitados' : `${groupLimitForPlan(detailOrg.plan)} grupos`}.
                    {canAddGroupToCenter(detailOrg.id) ? ' Aún puedes crear más grupos.' : ' Ya alcanzaste el límite.'}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {detailOrg.assignedGroups.length > 0 ? (
                  detailOrg.assignedGroups.map((group) => (
                    <li key={group} className="rounded-2xl bg-white px-3 py-2 border border-slate-200 text-sm text-slate-800">
                      {group}
                    </li>
                  ))
                ) : (
                  <li className="rounded-2xl bg-white px-3 py-2 border border-slate-200 text-sm text-slate-400">
                    No hay grupos asignados
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!actionTarget} onClose={() => { setActionTarget(null); setAdminPassword(''); }} title={actionTarget?.type === 'delete' ? 'Confirmar eliminación' : 'Confirmar desactivación'}>
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            {actionTarget?.type === 'delete'
              ? 'Esta acción eliminará el centro, todos sus grupos y las cuentas de los estudiantes asociados. Para continuar, ingresa la contraseña de administrador.'
              : 'Al desactivar este centro se desactivarán temporalmente todos sus grupos y alumnos asociados hasta que vuelva a activarse.'}
          </p>
          {actionTarget?.type === 'delete' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Contraseña de administrador</label>
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all" />
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => { setActionTarget(null); setAdminPassword(''); }} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all" style={{ border:'1px solid #e2e8f0', color:'#475569' }}>Cancelar</button>
            <button type="button" onClick={confirmAction} className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all ${actionTarget?.type === 'delete' ? 'bg-red-600' : 'bg-slate-700'}`}>
              {actionTarget?.type === 'delete' ? 'Eliminar' : 'Desactivar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
