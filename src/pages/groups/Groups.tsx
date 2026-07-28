import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Users, Pencil, MoreVertical, BookOpen, Trash2, AlertTriangle } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Modal } from '../../components/common/Modal/Modal';
import { getCentersRequest } from '../../services/centerService';
import { createGroupRequest, deleteGroupRequest, getGroupsRequest, updateGroupRequest } from '../../services/groupService';
import { getTeachersRequest } from '../../services/teacherService';
import { getStudentsRequest } from '../../services/studentService';
import type { Teacher } from '../../types/teacher.types';
import type { Center } from '../../types/center.types';
import type { Group } from '../../types/group.types';

const ALL_PROGRAM_OPTIONS = ['Entrenamiento Funcional', 'Nutrición Deportiva', 'Mindfulness', 'Pérdida de Peso'];
const PROGRAM_OPTIONS_BY_PLAN: Record<Required<Center>['plan'], string[]> = {
  'Básico': ['Entrenamiento Funcional', 'Nutrición Deportiva'],
  'Pro': ['Entrenamiento Funcional', 'Nutrición Deportiva', 'Mindfulness'],
  'Enterprise': ALL_PROGRAM_OPTIONS,
};

interface GroupProgramAssignment {
  program: string;
  mentor: string;
}

interface GroupView {
  id: string;
  name: string;
  org: string;
  centerId: string;
  mentor: string;
  students: number;
  status: 'En curso' | 'Inscripciones' | 'Finalizado';
  active: boolean;
  programs: GroupProgramAssignment[];
  members: string[];
}

const statusStyle: Record<string, string> = {
  'En curso': 'bg-blue-50 text-blue-700 border-blue-200',
  'Inscripciones': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Finalizado': 'bg-slate-100 text-slate-500 border-slate-200',
};

interface GroupProgramAssignmentForm {
  program: string;
  mentor: string;
}

interface NewGroupForm {
  name: string;
  centerId: string;
  active: boolean | 'true' | 'false';
  programs: GroupProgramAssignmentForm[];
}

export const Groups = () => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<{ name: string; group: string }[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [detailGroup, setDetailGroup] = useState<GroupView | null>(null);

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<NewGroupForm>({
    defaultValues: {
      name: '',
      centerId: '',
      active: true,
      programs: [{ program: '', mentor: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'programs' });
  const selectedCenterId = watch('centerId');
  const selectedCenter = useMemo(() => centers.find((center) => center.id === selectedCenterId), [centers, selectedCenterId]);
  const programOptions = useMemo(() => selectedCenter ? PROGRAM_OPTIONS_BY_PLAN[selectedCenter.plan] : ALL_PROGRAM_OPTIONS, [selectedCenter]);

  const groupViews = useMemo<GroupView[]>(() => {
    return (groups ?? []).map((group) => {
      const center = (centers ?? []).find((centerItem) => centerItem.id === group.centerId);
      const members = (students ?? []).filter((student) => student.group === group.name).map((student) => student.name);
      return {
        id: group.id,
        name: group.name,
        org: center?.name ?? 'Sin centro',
        centerId: group.centerId,
        mentor: group.programs?.[0]?.mentor ?? '',
        students: members.length,
        status: group.status,
        active: group.active,
        programs: group.programs ?? [],
        members,
      };
    });
  }, [groups, centers, students]);

  const filtered = useMemo(() => groupViews.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase()) ||
    group.org.toLowerCase().includes(search.toLowerCase()),
  ), [groupViews, search]);

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
      setStudents(studentData.map((student) => ({ name: student.name, group: student.group })));
    } catch (error) {
      console.error('Error cargando datos de grupos:', error);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    void getTeachersRequest(1, 1000)
      .then((response) => setTeachers(response?.data ?? []))
      .catch((error) => {
        console.error('Error cargando docentes:', error);
        setTeachers([]);
      });
  }, []);

  const refresh = async () => {
    await loadData();
  };

  const normalizeActive = (value: boolean | 'true' | 'false'): boolean => value === true || value === 'true';

  const canAddGroupToCenter = (centerId: string) => {
    const center = centers.find((item) => item.id === centerId);
    if (!center) return false;
    const currentCount = groups.filter((group) => group.centerId === centerId).length;
    if (center.plan === 'Básico') return currentCount < 2;
    if (center.plan === 'Pro') return currentCount < 6;
    return true;
  };

  const resetGroupForm = () => reset({
    name: '',
    centerId: '',
    active: true,
    programs: [{ program: '', mentor: '' }],
  });

  const handleSubmitGroup = async (data: NewGroupForm) => {
    const validPrograms = data.programs.filter((item) => item.program && item.mentor);
    if (validPrograms.length === 0) {
      alert('Agrega al menos un programa y selecciona su mentor.');
      return;
    }

    const selectedCenter = centers.find((center) => center.id === data.centerId);
    if (selectedCenter && !selectedCenter.active) {
      alert('No puedes crear grupos en un centro inactivo.');
      return;
    }

    if (!canAddGroupToCenter(data.centerId) && (!editingGroup || editingGroup.centerId !== data.centerId)) {
      alert('El centro seleccionado ya alcanzó el límite de grupos según su plan.');
      return;
    }

    const groupPayload = {
      name: data.name,
      centerId: data.centerId,
      status: editingGroup?.status ?? 'Inscripciones',
      active: normalizeActive(data.active),
      programs: validPrograms,
    };

    try {
      if (editingGroup) {
        await updateGroupRequest(editingGroup.id, groupPayload);
      } else {
        await createGroupRequest(groupPayload);
      }
      await refresh();
      setIsOpen(false);
      setEditingGroup(null);
      resetGroupForm();
    } catch (error) {
      console.error('Error guardando grupo:', error);
      alert('No se pudo guardar el grupo. Intenta de nuevo.');
    }
  };

  const openEdit = (groupView: GroupView) => {
    const group = groups.find((item) => item.id === groupView.id);
    if (!group) return;

    setEditingGroup(group);
    reset({
      name: group.name,
      centerId: group.centerId,
      active: group.active,
      programs: group.programs.length > 0 ? group.programs : [{ program: '', mentor: '' }],
    });
    setIsOpen(true);
  };

  const openDetails = (group: GroupView) => {
    setDetailGroup(group);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este grupo?')) return;
    try {
      await deleteGroupRequest(id);
      await refresh();
    } catch (error) {
      console.error('Error eliminando grupo:', error);
      alert('No se pudo eliminar el grupo.');
    }
  };

  const groupedByCenter = useMemo(() => {
    return centers.map((center) => ({
      center,
      groups: groupViews.filter((group) => group.centerId === center.id),
    })).filter((section) => section.groups.length > 0);
  }, [centers, groupViews]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: '#0f172a' }}>
            <Users size={24} style={{ color: '#7c3aed' }} />
            Grupos Académicos
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Gestiona cohortes, asigna mentores y controla participantes.
          </p>
        </div>
        <button
          onClick={() => { setEditingGroup(null); resetGroupForm(); setIsOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
        >
          <Plus size={16} /> Nuevo Grupo
        </button>
      </div>

      <div
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar grupo u organización..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
            style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {groupedByCenter.map((section) => (
          <div key={section.center.id} className="rounded-2xl bg-white p-4" style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{section.center.name}</h2>
                <p className="text-sm text-slate-500">{section.groups.length} grupos</p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${section.center.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                {section.center.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {section.groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-slate-50 rounded-2xl p-5 flex flex-col gap-4 transition-all hover:shadow-md relative"
                  style={{ border: '1px solid #f1f5f9' }}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1">
                    <button onClick={() => openDetails(group)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Ver detalle">
                      <MoreVertical size={16} style={{ color: '#94a3b8' }} />
                    </button>
                    <button onClick={() => openEdit(group)}
                      className="p-1.5 rounded-lg hover:bg-violet-50 transition-colors"
                      title="Editar grupo">
                      <Pencil size={16} style={{ color: '#7c3aed' }} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pr-8">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-extrabold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
                    >
                      {group.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold leading-tight truncate" style={{ color: '#0f172a' }}>{group.name}</h3>
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>{group.org}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {group.programs.map((assignment) => (
                        <span key={`${group.id}-${assignment.program}`} className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                          {assignment.program}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                      <BookOpen size={14} style={{ color: '#94a3b8' }} />
                      <span>{group.students} estudiantes</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #f8fafc' }}>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyle[group.status]}`}>
                      {group.status}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${group.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      {group.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={14} style={{ color: '#f87171' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center" style={{ color: '#94a3b8' }}>
            <Users size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No se encontraron grupos</p>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setEditingGroup(null); resetGroupForm(); }} title={editingGroup ? 'Editar Grupo' : 'Crear Nuevo Grupo'}>
        <form onSubmit={handleSubmit(handleSubmitGroup)} className="space-y-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: '#334155' }}>Nombre del Grupo</label>
            <input
              placeholder="Ej. Cohorte 2026 - Desarrollo Frontend"
              className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: errors.name ? '#f87171' : '#e2e8f0', color: '#0f172a' }}
              {...register('name', { required: 'El nombre es obligatorio' })}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: '#334155' }}>Centro</label>
            <select
              className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: errors.centerId ? '#f87171' : '#e2e8f0', color: '#0f172a' }}
              {...register('centerId', { required: 'Selecciona un centro' })}
            >
              <option value="">Seleccionar...</option>
              {centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.centerId && <p className="text-xs text-red-500">{errors.centerId.message}</p>}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                El límite de grupos depende del plan del centro: Básico 2, Pro 6 y Enterprise ilimitado.
                {selectedCenter ? ` Este centro puede usar ${programOptions.join(', ')}.` : ' Selecciona un centro para ver los programas disponibles.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: '#334155' }}>Programas y mentores</label>
              <button
                type="button"
                onClick={() => append({ program: '', mentor: '' })}
                className="inline-flex items-center gap-1 rounded-lg border border-violet-200 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50"
              >
                <Plus size={14} /> Agregar programa
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Programa {index + 1}</span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-xs font-medium text-rose-600 hover:text-rose-700"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <select
                      className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                      {...register(`programs.${index}.program`, { required: 'Selecciona un programa' })}
                    >
                      <option value="">Seleccionar...</option>
                      {programOptions.map((program) => <option key={program} value={program}>{program}</option>)}
                    </select>
                    {errors.programs?.[index]?.program && <p className="text-xs text-red-500">{errors.programs[index]?.program?.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <select
                      className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                      {...register(`programs.${index}.mentor`, { required: 'Selecciona un mentor' })}
                    >
                      <option value="">Seleccionar mentor...</option>
                      {teachers.map((teacher) => <option key={teacher.id} value={teacher.name}>{teacher.name}</option>)}
                    </select>
                    {errors.programs?.[index]?.mentor && <p className="text-xs text-red-500">{errors.programs[index]?.mentor?.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: '#334155' }}>Estado</label>
            <select
              className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
              {...register('active', { required: 'Selecciona un estado' })}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => { setIsOpen(false); setEditingGroup(null); resetGroupForm(); }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-100"
              style={{ border: '1px solid #e2e8f0', color: '#475569' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
            >
              {editingGroup ? 'Guardar cambios' : 'Crear Grupo'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!detailGroup} onClose={() => setDetailGroup(null)} title="Detalle del Grupo">
        {detailGroup && (
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Grupo</p>
              <p className="text-base font-semibold text-slate-900">{detailGroup.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Organización</p>
                <p className="text-sm font-medium text-slate-900">{detailGroup.org}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Programas</p>
                <div className="flex flex-wrap gap-2">
                  {detailGroup.programs.map((assignment) => (
                    <span key={`${detailGroup.id}-${assignment.program}`} className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                      {assignment.program}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Estudiantes</p>
                <p className="text-sm font-medium text-slate-900">{detailGroup.students}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Estado</p>
                <p className="text-sm font-medium text-slate-900">{detailGroup.status}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Alumnos asignados</p>
              <ul className="space-y-2">
                {detailGroup.members.map((member) => (
                  <li key={member} className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-800">
                    {member}
                  </li>
                ))}
                {detailGroup.members.length === 0 && (
                  <li className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-500">Sin alumnos asignados</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
