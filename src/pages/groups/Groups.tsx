import { useState } from 'react';
import { Plus, Search, Users, Pencil, MoreVertical, BookOpen, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Modal } from '../../componets/common/Modal/Modal';

const INITIAL_GROUPS: Group[] = [
  { id: '1', name: 'Cohorte Fitness 2026',         org: 'Academia WorkFlow',       mentor: 'Carlos Ruiz',    students: 45,  status: 'En curso',      members: ['Laura Gómez', 'Diego Torres', 'Mariana López', 'Camila Pérez'] },
  { id: '2', name: 'Programa Nutrición Pro',        org: 'WorkFlow Academy',        mentor: 'Ana Gómez',      students: 120, status: 'Inscripciones', members: ['Andrés Ramírez', 'Alejandra Ortiz', 'Sergio Díaz', 'Natalia Soto'] },
  { id: '3', name: 'Bienestar Mental Avanzado',     org: 'WorkFlow Academy',        mentor: 'Julián Parada',  students: 32,  status: 'En curso',      members: ['Camila Torres', 'Martín Muñoz', 'Laura Duarte', 'María Jiménez'] },
  { id: '4', name: 'Pérdida de Peso Sostenible',    org: 'Centro de Salud Vital',   mentor: 'Laura Silva',    students: 25,  status: 'Finalizado',    members: ['Sofía Vega', 'David Rojas', 'Mónica León', 'Raúl Herrera'] },
];

const statusStyle: Record<string, string> = {
  'En curso':      'bg-blue-50   text-blue-700   border-blue-200',
  'Inscripciones': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Finalizado':    'bg-slate-100  text-slate-500   border-slate-200',
};

interface Group {
  id:       string;
  name:     string;
  org:      string;
  mentor:   string;
  students: number;
  status:   'En curso' | 'Inscripciones' | 'Finalizado';
  members:  string[];
}

interface NewGroupForm { name: string; org: string; mentor: string; }

export const Groups = () => {
  const [groups, setGroups]       = useState<Group[]>(INITIAL_GROUPS);
  const [search, setSearch]       = useState('');
  const [isOpen, setIsOpen]       = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [detailGroup, setDetailGroup] = useState<Group | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewGroupForm>();

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.org.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = (data: NewGroupForm) => {
    if (editingGroup) {
      setGroups((prev) => prev.map((g) => g.id === editingGroup.id ? { ...g, ...data } : g));
    } else {
      setGroups([{ id: Math.random().toString(36).slice(2), ...data, students: 0, status: 'Inscripciones', members: [] }, ...groups]);
    }
    setIsOpen(false);
    setEditingGroup(null);
    reset();
  };

  const openEdit = (group: Group) => {
    setEditingGroup(group);
    reset({ name: group.name, org: group.org, mentor: group.mentor });
    setIsOpen(true);
  };

  const openDetails = (group: Group) => {
    setDetailGroup(group);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este grupo?')) {
      setGroups(groups.filter((g) => g.id !== id));
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* Encabezado */}
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
          onClick={() => { setEditingGroup(null); reset(); setIsOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
        >
          <Plus size={16} /> Nuevo Grupo
        </button>
      </div>

      {/* Buscador */}
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-2xl p-5 flex flex-col gap-4 transition-all hover:shadow-md relative"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            {/* Acciones */}
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

            {/* Avatar grupo */}
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

            {/* Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
                >
                  {group.mentor.charAt(0)}
                </div>
                <span>Mentor: <span className="font-semibold" style={{ color: '#334155' }}>{group.mentor}</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                <BookOpen size={14} style={{ color: '#94a3b8' }} />
                <span>{group.students} estudiantes</span>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: '1px solid #f8fafc' }}
            >
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyle[group.status]}`}>
                {group.status}
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

        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center" style={{ color: '#94a3b8' }}>
            <Users size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No se encontraron grupos</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setEditingGroup(null); reset(); }} title={editingGroup ? 'Editar Grupo' : 'Crear Nuevo Grupo'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

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
            <label className="text-sm font-medium" style={{ color: '#334155' }}>Organización</label>
            <select
              className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: errors.org ? '#f87171' : '#e2e8f0', color: '#0f172a' }}
              {...register('org', { required: 'Selecciona una organización' })}
            >
              <option value="">Seleccionar...</option>
              <option>Universidad Tecnológica</option>
              <option>Instituto de Desarrollo</option>
              <option>Academia CodeCraft</option>
            </select>
            {errors.org && <p className="text-xs text-red-500">{errors.org.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: '#334155' }}>Mentor Asignado</label>
            <input
              placeholder="Ej. Julián Parada"
              className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
              style={{ borderColor: errors.mentor ? '#f87171' : '#e2e8f0', color: '#0f172a' }}
              {...register('mentor', { required: 'El mentor es obligatorio' })}
            />
            {errors.mentor && <p className="text-xs text-red-500">{errors.mentor.message}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => { setIsOpen(false); setEditingGroup(null); reset(); }}
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
                <p className="text-xs text-slate-500 uppercase tracking-wide">Mentor</p>
                <p className="text-sm font-medium text-slate-900">{detailGroup.mentor}</p>
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
