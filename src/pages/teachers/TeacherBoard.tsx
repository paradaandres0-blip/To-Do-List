import { useEffect, useMemo, useState } from 'react';
import { Plus, GripVertical, LayoutGrid, Users, Trash2, CheckCircle, Clock, AlertCircle, Circle, X, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useActivityStore from '../../store/activityStore';
import useStudentStore from '../../store/studentStore';
import { getModulesRequest } from '../../services/moduleService';
import { getCoursesRequest } from '../../services/courseService';
import type { Module } from '../../types/module.types';
import type { Course } from '../../types/course.types';
import type { Activity, ActivityStatus } from '../../types/activity.types';
import { ACTIVITY_STATUSES } from '../../types/activity.types';

const statusIcon: Record<ActivityStatus, React.ReactElement> = {
  'Aprobada':      <CheckCircle size={14} className="text-emerald-500" />,
  'En revisión':   <Clock        size={14} className="text-amber-500" />,
  'En desarrollo': <Circle       size={14} className="text-blue-500" />,
  'Pendiente':     <AlertCircle  size={14} className="text-slate-400" />,
};

const statusStyle: Record<ActivityStatus, string> = {
  'Aprobada':      'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En revisión':   'bg-amber-50   text-amber-700   border-amber-200',
  'En desarrollo': 'bg-blue-50    text-blue-700    border-blue-200',
  'Pendiente':     'bg-slate-50   text-slate-500   border-slate-200',
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen:boolean; onClose:()=>void; title:string; children:React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
};

export const TeacherBoard = () => {
  const user = useAuthStore((s) => s.user);
  const activities = useActivityStore((s) => s.activities);
  const loadByTeacher = useActivityStore((s) => s.loadByTeacher);
  const updateActivity = useActivityStore((s) => s.updateActivity);
  const createActivity = useActivityStore((s) => s.createActivity);
  const deleteActivity = useActivityStore((s) => s.deleteActivity);
  const students = useStudentStore((s) => s.students);
  const getByTeacherId = useStudentStore((s) => s.getByTeacherId);

  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLesson, setFormLesson] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formStatus, setFormStatus] = useState<ActivityStatus>('Pendiente');
  const [showPassword, setShowPassword] = useState(false);

  // Cursos asignados al docente según los programas que imparten sus estudiantes
  const myCourseIds = useMemo(() => {
    if (!user?.teacherId) return [];
    const teacherStudents = students.filter((student) => student.teacherId === user.teacherId);
    const programNames = Array.from(new Set(teacherStudents.map((student) => student.program).filter(Boolean)));
    return courses.filter((course) => programNames.includes(course.title)).map((course) => course.id);
  }, [courses, students, user?.teacherId]);

  // Cargar datos
  useEffect(() => {
    const load = async () => {
      try {
        const [modulesData, coursesData] = await Promise.all([
          getModulesRequest(),
          getCoursesRequest(),
        ]);
        setModules(modulesData);
        setCourses(coursesData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    load();
    if (user?.teacherId) {
      loadByTeacher(user.teacherId);
    }
  }, [user?.teacherId, loadByTeacher]);

  // Mis cursos (solo los que tengo asignados)
  const myCourses = useMemo(() => {
    return courses.filter((c) => myCourseIds.includes(c.id));
  }, [courses, myCourseIds]);

  // Módulos de mis cursos
  const myModules = useMemo(() => {
    const courseTitles = myCourses.map((c) => c.title);
    return modules.filter((m) => courseTitles.includes(m.course) && m.status === 'Activo');
  }, [modules, myCourses]);

  // Módulos filtrados por curso seleccionado
  const filteredModules = useMemo(() => {
    if (selectedCourseId === 'all') return myModules;
    const course = courses.find((c) => c.id === selectedCourseId);
    if (!course) return myModules;
    return myModules.filter((m) => m.course === course.title);
  }, [myModules, selectedCourseId, courses]);

  // Mis estudiantes (los que están en los cursos que imparto)
  const myStudents = useMemo(() => {
    if (!user?.teacherId) return [];
    return getByTeacherId(user.teacherId);
  }, [user?.teacherId, getByTeacherId, students]);

  // Actividades agrupadas por módulo
  const activitiesByModule = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    filteredModules.forEach((mod) => {
      map[mod.id] = activities.filter((a) => a.moduleId === mod.id);
    });
    return map;
  }, [filteredModules, activities]);

  const onDragStart = (activityId: string) => setDraggingId(activityId);

  const onDrop = async (moduleId: string) => {
    if (!draggingId) return;
    const activity = activities.find((a) => a.id === draggingId);
    if (activity && activity.moduleId !== moduleId) {
      await updateActivity(draggingId, { moduleId });
    }
    setDraggingId(null);
  };

  const openCreate = (moduleId: string) => {
    setEditingActivity(null);
    setSelectedModuleId(moduleId);
    setFormTitle('');
    setFormDescription('');
    setFormLesson('');
    setFormStudentId(myStudents[0]?.id ?? '');
    setFormStatus('Pendiente');
    setModalOpen(true);
  };

  const openEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setSelectedModuleId(activity.moduleId);
    setFormTitle(activity.title);
    setFormDescription(activity.description);
    setFormLesson(activity.lesson);
    setFormStudentId(activity.studentId);
    setFormStatus(activity.status);
    setModalOpen(true);
  };

  const mapStatusToProgress = (status: ActivityStatus): number => {
    switch (status) {
      case 'Aprobada': return 100;
      case 'En revisión': return 75;
      case 'En desarrollo': return 50;
      default: return 0;
    }
  };

  const handleSubmit = async () => {
    if (!user?.teacherId || !formTitle || !formStudentId) return;
    const mod = modules.find((m) => m.id === selectedModuleId);
    const courseTitle = mod?.course ?? '';
    const newProgress = mapStatusToProgress(formStatus);

    if (editingActivity) {
      await updateActivity(editingActivity.id, {
        title: formTitle, description: formDescription, lesson: formLesson,
        studentId: formStudentId, status: formStatus, progress: newProgress,
      });
    } else {
      await createActivity({
        title: formTitle, description: formDescription, lesson: formLesson,
        moduleId: selectedModuleId, courseId: courseTitle, studentId: formStudentId,
        teacherId: user.teacherId, status: formStatus, progress: newProgress,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar esta actividad?')) await deleteActivity(id);
  };

  if (!user?.teacherId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Debes ser docente para ver este tablero.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-slate-900">
            <LayoutGrid size={22} className="text-purple-600" />
            Tablero de Actividades
          </h1>
          <p className="text-xs mt-0.5 text-slate-400">
            {user?.name?.split(' ')[0] ?? 'Docente'} — {myCourses.length} cursos asignados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-slate-100 border border-slate-200 text-slate-700"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            {showPassword ? 'Ocultar' : 'Mostrar'} contraseña
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-sm rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="all">Todos los cursos</option>
            {myCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-purple-50 border border-purple-200 text-purple-600">
            <Users size={15} />
            {myStudents.length} alumnos
          </div>
        </div>
      </div>

      {showPassword && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-semibold">Credencial de acceso</p>
          <p className="mt-1">Correo: {user?.email ?? 'docente@workflow.academy'}</p>
          <p className="font-mono">Contraseña: 123456</p>
        </div>
      )}

      {filteredModules.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 min-h-[280px]">
          <LayoutGrid size={40} className="mb-3 opacity-30 text-slate-400" />
          <p className="text-sm font-semibold text-slate-900">No hay módulos publicados</p>
          <p className="text-xs mt-1 text-slate-400">Espera a que se asignen cursos con módulos publicados.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max pb-2">
            {filteredModules.map((mod) => {
              const moduleActivities = activitiesByModule[mod.id] ?? [];
              return (
                <div
                  key={mod.id}
                  className="w-72 flex flex-col rounded-2xl flex-shrink-0 bg-slate-100 border border-slate-200"
                  style={{ maxHeight: '100%' }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(mod.id)}
                >
                  <div className="px-3 py-3 flex items-center justify-between flex-shrink-0 border-b border-slate-200/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-900 truncate">{mod.title}</h2>
                        <p className="text-[10px] text-slate-400 truncate">{mod.course}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-slate-500 flex-shrink-0 ml-2">
                      {moduleActivities.length}
                    </span>
                  </div>

                  <div className="px-2 pb-2 flex-1 overflow-y-auto space-y-2 min-h-[100px] pt-2">
                    {moduleActivities.map((activity) => {
                      const student = students.find((s) => s.id === activity.studentId);
                      return (
                        <div
                          key={activity.id}
                          draggable
                          onDragStart={() => onDragStart(activity.id)}
                          onDragEnd={() => setDraggingId(null)}
                          onClick={() => openEdit(activity)}
                          className="bg-white rounded-xl p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md"
                          style={{ border: '1px solid #f1f5f9', opacity: draggingId === activity.id ? 0.6 : 1 }}
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical size={14} className="mt-0.5 flex-shrink-0 text-slate-300" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{activity.title}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{student?.name ?? 'Sin asignar'}</p>
                              {activity.lesson && <p className="text-[10px] text-slate-500 mt-1 truncate">📖 {activity.lesson}</p>}
                              <div className="mt-2">
                                <div className="flex justify-between text-[10px] mb-1">
                                  <span className="text-slate-400">Progreso</span>
                                  <span className="font-bold text-purple-600">{activity.progress}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-100">
                                  <div className="h-1.5 rounded-full transition-all" style={{
                                    width: `${activity.progress}%`,
                                    background: activity.progress === 100 ? 'linear-gradient(90deg,#059669,#10b981)' : 'linear-gradient(90deg,#7c3aed,#2563eb)',
                                  }} />
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  {statusIcon[activity.status]}
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${statusStyle[activity.status]}`}>{activity.status}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(activity.id); }}
                                  className="p-0.5 rounded hover:bg-red-50 transition-colors">
                                  <Trash2 size={11} className="text-red-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {moduleActivities.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-xs text-slate-400">Arrastra actividades aquí</div>
                    )}
                  </div>

                  <div className="px-2 pb-2 flex-shrink-0">
                    <button onClick={() => openCreate(mod.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-purple-100 bg-purple-50 text-purple-600 border border-purple-200">
                      <Plus size={13} /> Añadir actividad
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-200 min-h-[80px] resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lección</label>
            <input type="text" value={formLesson} onChange={(e) => setFormLesson(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estudiante</label>
            <select value={formStudentId} onChange={(e) => setFormStudentId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-200">
              <option value="">Seleccionar</option>
              {myStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.group}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as ActivityStatus)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-200">
                {ACTIVITY_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
              <p className="text-xs text-slate-400 mt-2">El progreso se calcula automáticamente según el estado de la actividad.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all border border-slate-200 text-slate-600">Cancelar</button>
            <button onClick={handleSubmit}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-purple-600 to-blue-600 hover:opacity-90 transition-all">
              {editingActivity ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};