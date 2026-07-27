import { useMemo, useState, useEffect } from 'react';
import { Layers, Plus, Search, ChevronRight, BookOpen, Clock, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Modal } from '../../components/common/Modal/Modal';
import { useForm } from 'react-hook-form';
import type { Module } from '../../types/module.types';
import type { Course } from '../../types/course.types';
import {
  getModulesRequest,
  createModuleRequest,
  updateModuleRequest,
  deleteModuleRequest
} from '../../services/moduleService';
import { getCoursesRequest } from '../../services/courseService';
import useActivityStore from '../../store/activityStore';

interface ModuleFormInputs {
  course: string;
  title: string;
  duration: string;
  status: 'Activo' | 'Inactivo';
}

export const Modules = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const activities = useActivityStore((s) => s.activities);
  const loadActivities = useActivityStore((s) => s.loadActivities);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ModuleFormInputs>({
    defaultValues: {
      course: '',
      title: '',
      duration: '',
      status: 'Inactivo',
    }
  });

  // Cargar módulos y cursos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesData, coursesData] = await Promise.all([
          getModulesRequest(),
          getCoursesRequest(),
          loadActivities(),
        ]);
        setModules(modulesData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [loadActivities]);

  // Rellenar formulario cuando se edita o se abre en modo creación
  useEffect(() => {
    if (editingModule) {
      reset({
        course: editingModule.course,
        title: editingModule.title,
        duration: editingModule.duration,
        status: editingModule.status,
      });
    } else {
      reset({
        course: '',
        title: '',
        duration: '',
        status: 'Inactivo',
      });
    }
  }, [editingModule, reset]);

  const moduleProgress = useMemo(() => {
    const progressMap: Record<string, number> = {};
    const moduleActivities: Record<string, number[]> = {};

    activities.forEach((activity) => {
      if (!moduleActivities[activity.moduleId]) {
        moduleActivities[activity.moduleId] = [];
      }
      moduleActivities[activity.moduleId].push(activity.progress);
    });

    Object.entries(moduleActivities).forEach(([moduleId, progresses]) => {
      if (progresses.length === 0) return;
      const sum = progresses.reduce((acc, value) => acc + value, 0);
      progressMap[moduleId] = Math.round(sum / progresses.length);
    });

    return progressMap;
  }, [activities]);

  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const openModule = (mod: Module) => setActiveModule(mod);
  const closeModule = () => setActiveModule(null);

  const filtered = modules.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.course.toLowerCase().includes(search.toLowerCase())
  );

  const modulesByCourse = useMemo(() => {
    return filtered.reduce<Record<string, Module[]>>((acc, module) => {
      if (!acc[module.course]) acc[module.course] = [];
      acc[module.course].push(module);
      return acc;
    }, {});
  }, [filtered]);

  const activityCountByModule = useMemo(() => {
    const countMap: Record<string, number> = {};
    activities.forEach((activity) => {
      countMap[activity.moduleId] = (countMap[activity.moduleId] ?? 0) + 1;
    });
    return countMap;
  }, [activities]);

  const onSubmit = async (data: ModuleFormInputs) => {
    setIsSaving(true);
    try {
      const formattedData = {
        ...data,
        lessons: editingModule ? editingModule.lessons : 0,
      };

      if (editingModule) {
        const updatedModule = await updateModuleRequest(editingModule.id, formattedData);
        setModules(modules.map((m) => (m.id === editingModule.id ? updatedModule : m)));
      } else {
        const newModule = await createModuleRequest(formattedData);
        setModules([newModule, ...modules]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar módulo:', error);
      alert('Hubo un error al guardar el módulo. Por favor intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (mod: Module) => {
    setEditingModule(mod);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este módulo de aprendizaje?')) {
      try {
        await deleteModuleRequest(id);
        setModules(modules.filter((m) => m.id !== id));
      } catch (error) {
        console.error('Error al eliminar módulo:', error);
        alert('Hubo un error al eliminar el módulo. Por favor intenta de nuevo.');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingModule(null);
    reset();
  };

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
        <Button leftIcon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
          Nuevo Módulo
        </Button>
      </div>

      {/* Buscador */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl bg-white"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar módulo o curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
            style={{ borderColor: '#e2e8f0', color: '#0f172a', background: '#f8fafc' }}
          />
        </div>
      </div>

      {/* Grid de módulos */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-dark-gray/60 bg-white border border-light-gray/40 rounded-xl shadow-saas-sm p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
          <p className="font-medium text-sm">Cargando módulos...</p>
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {Object.entries(modulesByCourse).map(([courseTitle, courseModules]) => (
              <div key={courseTitle} className="rounded-2xl bg-white p-4" style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{courseTitle}</h2>
                    <p className="text-sm text-slate-500">{courseModules.length} módulos</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {courseModules.map((mod) => (
                    <div
                      key={mod.id}
                      className="bg-slate-50 rounded-2xl p-5 flex flex-col gap-4 cursor-pointer group transition-all hover:shadow-md"
                      style={{ border: '1px solid #f1f5f9' }}
                    >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.1))' }}
                  >
                    <Layers size={20} style={{ color: '#7c3aed' }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        mod.status === 'Activo'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {mod.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(mod); }}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors"
                      title="Editar módulo"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(mod.id); }}
                      className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition-colors"
                      title="Eliminar módulo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#7c3aed' }}>{mod.course}</p>
                  <h3 className="text-base font-bold" style={{ color: '#0f172a' }}>{mod.title}</h3>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs" style={{ color: '#64748b' }}>
                  <span className="flex items-center gap-1">
                    <BookOpen size={13} /> {activityCountByModule[mod.id] ?? 0} actividades
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {mod.duration}
                  </span>
                </div>

                {/* Progreso calculado */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Progreso</span>
                    <span className="text-xs font-bold" style={{ color: (moduleProgress[mod.id] ?? 0) === 100 ? '#059669' : '#7c3aed' }}>
                      {moduleProgress[mod.id] ?? 0}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${moduleProgress[mod.id] ?? 0}%`,
                        background: (moduleProgress[mod.id] ?? 0) === 100
                          ? 'linear-gradient(90deg,#059669,#10b981)'
                          : 'linear-gradient(90deg,#7c3aed,#2563eb)',
                      }}
                    />
                  </div>
                </div>

                      {/* Acción */}
                      <button
                        onClick={() => openModule(mod)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all group-hover:opacity-80"
                        style={{
                          background: 'rgba(124,58,237,0.06)',
                          border: '1px solid rgba(124,58,237,0.15)',
                          color: '#7c3aed',
                        }}
                      >
                        {(moduleProgress[mod.id] ?? 0) === 100 ? <CheckCircle2 size={13} /> : <ChevronRight size={13} />}
                        {(moduleProgress[mod.id] ?? 0) === 100 ? 'Completado' : 'Ver módulo'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center bg-white border border-light-gray/40 rounded-xl shadow-saas-sm" style={{ color: '#94a3b8' }}>
              <Layers size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No se encontraron módulos</p>
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!activeModule} onClose={closeModule} title={activeModule ? `Módulo: ${activeModule.title}` : ''}>
        {activeModule && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Curso: {activeModule.course}</p>
            <div>
              <p className="text-sm font-semibold mb-2">Actividades</p>
              <ul className="space-y-2">
                {activities.filter((a) => a.moduleId === activeModule.id).map((act) => (
                  <li key={act.id} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: '#0f172a' }}>{act.title}</p>
                      <p className="text-xs text-slate-500">{act.lesson} • {act.status} • {act.progress}%</p>
                    </div>
                    <div className="text-xs text-slate-400">{new Date(act.createdAt).toLocaleDateString('es-CO')}</div>
                  </li>
                ))}
                {activities.filter((a) => a.moduleId === activeModule.id).length === 0 && (
                  <li className="p-3 rounded-xl bg-slate-50 text-slate-500">No hay actividades</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Crear/Editar Módulo */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingModule ? 'Editar Módulo' : 'Crear Nuevo Módulo'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-dark-gray mb-1.5">
              Curso / Programa
            </label>
            <select
              className="block w-full rounded-lg border border-light-gray/60 bg-background text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm px-3 py-2.5"
              {...register('course', { required: 'El curso es obligatorio' })}
            >
              <option value="">Selecciona un curso</option>
              {courses.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
            {errors.course && (
              <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.course.message}</p>
            )}
          </div>

          <Input
            label="Título del Módulo"
            placeholder="Ej: Introducción a la anatomía"
            error={errors.title?.message}
            {...register('title', { required: 'El título es obligatorio' })}
          />

          <Input
            label="Duración Estimada"
            placeholder="Ej: 4h 30m"
            error={errors.duration?.message}
            {...register('duration', { required: 'La duración es obligatoria' })}
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-dark-gray mb-1.5">
              Estado
            </label>
            <select
              className="block w-full rounded-lg border border-light-gray/60 bg-background text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm px-3 py-2.5"
              {...register('status', { required: 'El estado es obligatorio' })}
            >
              <option value="Inactivo">Inactivo</option>
              <option value="Activo">Activo</option>
            </select>
            {errors.status && (
              <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.status.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingModule ? 'Guardar Cambios' : 'Crear Módulo'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
