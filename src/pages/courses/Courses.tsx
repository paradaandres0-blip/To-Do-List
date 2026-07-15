import { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Layout, Settings2, Trash2, Clock, CheckCircle2, Pencil } from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Modal } from '../../components/common/Modal/Modal';
import { useForm } from 'react-hook-form';
import type { Course } from '../../types/course.types';
import {
  getCoursesRequest,
  createCourseRequest,
  updateCourseRequest,
  deleteCourseRequest
} from '../../services/courseService';

interface CourseFormInputs {
  title: string;
  description: string;
  group: string;
  status: 'Publicado' | 'Borrador';
}

export const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseFormInputs>({
    defaultValues: {
      title: '',
      description: '',
      group: '',
      status: 'Borrador'
    }
  });

  // Cargar cursos al montar el componente
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCoursesRequest();
        setCourses(data);
      } catch (error) {
        console.error('Error al obtener cursos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Rellenar formulario cuando se edita o se abre en modo creación
  useEffect(() => {
    if (editingCourse) {
      reset({
        title: editingCourse.title,
        description: editingCourse.description,
        group: editingCourse.group,
        status: editingCourse.status,
      });
    } else {
      reset({
        title: '',
        description: '',
        group: '',
        status: 'Borrador',
      });
    }
  }, [editingCourse, reset]);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: CourseFormInputs) => {
    setIsSaving(true);
    try {
      if (editingCourse) {
        // Modo Edición
        const updatedCourse = await updateCourseRequest(editingCourse.id, data);
        setCourses(courses.map((c) => (c.id === editingCourse.id ? updatedCourse : c)));
      } else {
        // Modo Creación
        const newCourse = await createCourseRequest(data);
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
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" leftIcon={<Settings2 size={16} />}>
            Filtros Avanzados
          </Button>
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
                        course.status === 'Publicado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
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
                      <span>{course.group}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      <span>{course.modulesCount} Módulos</span>
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
          <Input
            label="Grupo Asignado"
            placeholder="Ej: Cohorte 2026 - Desarrollo Web"
            error={errors.group?.message}
            {...register('group', { required: 'El grupo es obligatorio' })}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-dark-gray mb-1.5">
              Estado
            </label>
            <select
              className="block w-full rounded-lg border border-light-gray/60 bg-background text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm px-3 py-2.5"
              {...register('status', { required: 'El estado es obligatorio' })}
            >
              <option value="Borrador">Borrador</option>
              <option value="Publicado">Publicado</option>
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
