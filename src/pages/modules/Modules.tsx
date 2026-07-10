import { useState } from 'react';
import { Layers, Plus, Search, ChevronRight, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

const MODULES = [
  {
    id: '1', course: 'Entrenamiento Físico', title: 'Fundamentos del Movimiento',
    lessons: 8, duration: '4h 30m', status: 'Publicado', progress: 100,
  },
  {
    id: '2', course: 'Entrenamiento Físico', title: 'Hipertrofia y Fuerza',
    lessons: 10, duration: '5h 20m', status: 'Publicado', progress: 78,
  },
  {
    id: '3', course: 'Nutrición', title: 'Macronutrientes Esenciales',
    lessons: 7, duration: '3h 45m', status: 'Publicado', progress: 55,
  },
  {
    id: '4', course: 'Nutrición', title: 'Planes de Alimentación',
    lessons: 6, duration: '3h 10m', status: 'Borrador', progress: 20,
  },
  {
    id: '5', course: 'Bienestar Mental', title: 'Mindfulness y Meditación',
    lessons: 9, duration: '6h 00m', status: 'Publicado', progress: 90,
  },
  {
    id: '6', course: 'Bienestar Mental', title: 'Gestión del Estrés',
    lessons: 5, duration: '2h 30m', status: 'Publicado', progress: 42,
  },
];

export const Modules = () => {
  const [search, setSearch] = useState('');

  const filtered = MODULES.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: '#0f172a' }}>
            <Layers size={24} style={{ color: '#7c3aed' }} />
            Módulos de Aprendizaje
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Gestiona el contenido didáctico por curso y módulo.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
        >
          <Plus size={16} /> Nuevo Módulo
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
            placeholder="Buscar módulo o curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
            style={{ borderColor: '#e2e8f0', color: '#0f172a' }}
          />
        </div>
      </div>

      {/* Grid de módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((mod) => (
          <div
            key={mod.id}
            className="bg-white rounded-2xl p-5 flex flex-col gap-4 cursor-pointer group transition-all hover:shadow-md"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.1))' }}
              >
                <Layers size={20} style={{ color: '#7c3aed' }} />
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  mod.status === 'Publicado'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {mod.status}
              </span>
            </div>

            {/* Info */}
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#7c3aed' }}>{mod.course}</p>
              <h3 className="text-base font-bold" style={{ color: '#0f172a' }}>{mod.title}</h3>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs" style={{ color: '#64748b' }}>
              <span className="flex items-center gap-1">
                <BookOpen size={13} /> {mod.lessons} lecciones
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} /> {mod.duration}
              </span>
            </div>

            {/* Progreso */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Progreso</span>
                <span className="text-xs font-bold" style={{ color: mod.progress === 100 ? '#059669' : '#7c3aed' }}>
                  {mod.progress}%
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${mod.progress}%`,
                    background: mod.progress === 100
                      ? 'linear-gradient(90deg,#059669,#10b981)'
                      : 'linear-gradient(90deg,#7c3aed,#2563eb)',
                  }}
                />
              </div>
            </div>

            {/* Acción */}
            <button
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all group-hover:opacity-80"
              style={{
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.15)',
                color: '#7c3aed',
              }}
            >
              {mod.progress === 100 ? <CheckCircle2 size={13} /> : <ChevronRight size={13} />}
              {mod.progress === 100 ? 'Completado' : 'Ver módulo'}
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center" style={{ color: '#94a3b8' }}>
          <Layers size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No se encontraron módulos</p>
        </div>
      )}
    </div>
  );
};
