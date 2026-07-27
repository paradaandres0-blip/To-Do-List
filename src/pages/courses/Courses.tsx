import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, BookOpen, Layout, Trash2, Clock, CheckCircle2, Pencil } from 'lucide-react';
import type { Module } from '../../types/module.types';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Modal } from '../../components/common/Modal/Modal';
import { useFieldArray, useForm } from 'react-hook-form';
import type { Course } from '../../types/course.types';
import {
  getCoursesRequest,
  createCourseRequest,
  updateCourseRequest,
  deleteCourseRequest
} from '../../services/courseService';
import { GROUPS } from '../../services/sharedMockDb';
import { getModulesRequest } from '../../services/moduleService';
import useActivityStore from '../../store/activityStore';

interface CourseFormInputs {
  title: string;
  description: string;
  groups: Array<{ group: string }>;
  status: 'Activo' | 'Inactivo';
}

export const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activo' | 'Inactivo'>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const loadActivities = useActivityStore((s) => s.loadActivities);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<CourseFormInputs>({
    defaultValues: {
      title: '',
      description: '',
      groups: [{ group: '' }],
      status: 'Inactivo'
    }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'groups' });

  // Cargar cursos al montar el componente
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [coursesData, modulesData] = await Promise.all([
          getCoursesRequest(),
          getModulesRequest(),
        ]);
        setCourses(coursesData);
        setModules(modulesData);
        await loadActivities();
      } catch (error) {
        console.error('Error al obtener cursos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [loadActivities]);

  // Rellenar formulario cuando se edita o se abre en modo creación
  useEffect(() => {
    if (editingCourse) {
      reset({
        title: editingCourse.title,
        description: editingCourse.description,
        groups: (editingCourse.groups ?? []).map((group) => ({ group })),
        status: editingCourse.status,
      });
    } else {
      reset({
        title: '',
        description: '',
        groups: [{ group: '' }],
        status: 'Inactivo',
      });
    }
  }, [editingCourse, reset]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.groups ?? []).some((group) => group.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'Todos' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const moduleCountByCourse = useMemo(() => {
    const countMap: Record<string, number> = {};
    modules.forEach((module) => {
      countMap[module.course] = (countMap[module.course] ?? 0) + 1;
    });
    return countMap;
  }, [modules]);

  const onSubmit = async (data: CourseFormInputs) => {
    const validGroups = data.groups.map((item) => item.group).filter(Boolean);
    if (validGroups.length === 0) {
      alert('Agrega al menos un grupo asignado al curso.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = { ...data, groups: validGroups };
      if (editingCourse) {
        const updatedCourse = await updateCourseRequest(editingCourse.id, payload);
        setCourses(courses.map((c) => (c.id === editingCourse.id ? updatedCourse : c)));
      } else {
        const newCourse = await createCourseRequest(payload);
        setCourses([newCourse, ...courses]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar el curso:', error);
      alert('Hubo un error al guardar el curso. Por favor intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este curso? Se perderán todos sus módulos.')) {
      try {
        await deleteCourseRequest(id);
        setCourses(courses.filter((c) => c.id !== id));
      } catch (error) {
        console.error('Error al eliminar curso:', error);
        alert('Hubo un error al eliminar el curso. Por favor intenta de nuevo.');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    reset();
  };

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
            <BookOpen size={24} className="text-primary" />
            Gestión de Cursos
          </h1>
          <p className="text-sm text-dark-gray/80 mt-1">
            Administra el contenido, los módulos y las asignaciones por grupo.
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Crear Curso
        </Button>
      </div>

      {/* Barra de Herramientas */}
      <div className="bg-white p-4 rounded-xl border border-light-gray/40 shadow-saas-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Buscar por título o grupo..."
            icon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {(['Todos', 'Activo', 'Inactivo'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${statusFilter === filter ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Cursos / Loading / Empty */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-dark-gray/60 bg-white border border-light-gray/40 rounded-xl shadow-saas-sm p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
          <p className="font-medium text-sm">Cargando cursos...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-light-gray/40 shadow-saas-sm p-5 hover:border-primary/30 transition-colors group flex flex-col md:flex-row gap-6 md:items-center justify-between"
              >
                {/* Información Principal */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-dark">{course.title}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        course.status === 'Activo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <p className="text-sm text-dark-gray/80 mb-3 line-clamp-2 max-w-3xl">
                    {course.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-light-gray">
                    <div className="flex items-center gap-1.5 text-secondary">
                      <Layout size={14} />
                      <span>{(course.groups ?? []).join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      <span>{moduleCountByCourse[course.title] ?? course.modulesCount} módulos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>Actualizado {course.lastUpdate}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-light-gray/30 pt-4 md:pt-0 md:pl-6">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Pencil size={14} />}
                    onClick={() => handleEdit(course)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => handleDelete(course.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-dark-gray/60 bg-white border border-light-gray/40 rounded-xl shadow-saas-sm">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No se encontraron cursos</p>
              <p className="text-sm mt-1">Intenta con otro término de búsqueda.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Crear/Editar Curso */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Título del Curso"
            placeholder="Ej: Desarrollo Web con React"
            error={errors.title?.message}
            {...register('title', { required: 'El título es obligatorio' })}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-dark-gray mb-1.5">
              Descripción
            </label>
            <textarea
              className="block w-full rounded-lg border border-light-gray/60 bg-background text-dark placeholder-light-gray focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm px-3 py-2.5 min-h-[80px] resize-none"
              placeholder="Descripción breve del curso..."
              {...register('description', { required: 'La descripción es obligatoria' })}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.description.message}</p>
            )}
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-dark-gray">
                Grupos asignados
              </label>
              <button
                type="button"
                onClick={() => append({ group: '' })}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/20 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
              >
                <Plus size={14} /> Agregar grupo
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <div className="flex-1">
                    <select
                      className="block w-full rounded-lg border border-light-gray/60 bg-background text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm px-3 py-2.5"
                      {...register(`groups.${index}.group`, { required: 'Selecciona un grupo' })}
                    >
                      <option value="">Seleccionar grupo...</option>
                      {GROUPS.map((group) => (
                        <option key={group.id} value={group.name}>{group.name}</option>
                      ))}
                    </select>
                    {errors.groups?.[index]?.group && (
                      <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.groups[index]?.group?.message}</p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
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
              {editingCourse ? 'Guardar Cambios' : 'Crear Curso'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
