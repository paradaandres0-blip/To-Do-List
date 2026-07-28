import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, Building2, Eye, EyeOff, LayoutGrid, Layers, Plus, Users, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useActivityStore from '../../store/activityStore';
import useStudentStore from '../../store/studentStore';
import { getCentersRequest } from '../../services/centerService';
import { getCoursesRequest } from '../../services/courseService';
import { getGroupsRequest } from '../../services/groupService';
import { getModulesRequest } from '../../services/moduleService';
import type { Activity, ActivityStatus } from '../../types/activity.types';
import { ACTIVITY_STATUSES } from '../../types/activity.types';
import type { Center } from '../../types/center.types';
import type { Course } from '../../types/course.types';
import type { Group } from '../../types/group.types';
import type { Module } from '../../types/module.types';

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
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
  const loadStudents = useStudentStore((s) => s.loadStudents);

  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('all');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLesson, setFormLesson] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formStatus, setFormStatus] = useState<ActivityStatus>('Pendiente');
  const [showPassword, setShowPassword] = useState(false);

  const teacherStudents = useMemo(() => {
    if (!user?.teacherId) return [];
    return getByTeacherId(user.teacherId);
  }, [getByTeacherId, user?.teacherId]);

  const teacherGroupNames = useMemo(() => Array.from(new Set(teacherStudents.map((student) => student.group).filter(Boolean))), [teacherStudents]);
  const teacherGroups = useMemo(() => groups.filter((group) => teacherGroupNames.includes(group.name)), [groups, teacherGroupNames]);
  const teacherCenters = useMemo(() => centers.filter((center) => teacherGroups.some((group) => group.centerId === center.id)), [centers, teacherGroups]);

  const visibleGroups = useMemo(() => {
    return teacherGroups.filter((group) => selectedCenterId === 'all' || group.centerId === selectedCenterId);
  }, [selectedCenterId, teacherGroups]);

  const isCourseAssignedToGroup = (course: Course, group: Group) => {
    const title = course.title.toLowerCase();
    const groupMatch = course.groups.some((groupName) => groupName.toLowerCase() === group.name.toLowerCase());
    const programMatch = group.programs.some((assignment) => title.includes(assignment.program.toLowerCase()));
    return groupMatch || programMatch;
  };

  const boardGroups = useMemo(() => {
    return visibleGroups.map((group) => ({
      group,
      courses: courses.filter((course) => isCourseAssignedToGroup(course, group)).map((course) => ({
        course,
        modules: modules.filter((module) => module.course === course.title && module.status === 'Activo'),
      })),
    }));
  }, [courses, modules, visibleGroups]);

  const myCourses = useMemo(() => courses.filter((course) => boardGroups.some((entry) => entry.courses.some((item) => item.course.id === course.id))), [boardGroups, courses]);

  const activitiesByModule = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    modules.forEach((module) => {
      map[module.id] = activities.filter((activity) => activity.moduleId === module.id);
    });
    return map;
  }, [activities, modules]);

  useEffect(() => {
    const load = async () => {
      setLoadError(null);
      try {
        const [modulesData, coursesData, groupsData, centersData] = await Promise.all([
          getModulesRequest(),
          getCoursesRequest(),
          getGroupsRequest(),
          getCentersRequest(),
        ]);
        setModules(modulesData);
        setCourses(coursesData);
        setGroups(groupsData);
        setCenters(centersData);
      } catch (error) {
        console.error('No se pudo cargar la estructura del backend', error);
        setLoadError('No se pudo cargar la estructura del backend. Revisa la conexión con la base de datos.');
      }
    };

    load();
    loadStudents();
    if (user?.teacherId) {
      loadByTeacher(user.teacherId);
    }
  }, [loadByTeacher, loadStudents, user?.teacherId]);

  const openCreate = (moduleId: string) => {
    setEditingActivity(null);
    setSelectedModuleId(moduleId);
    setFormTitle('');
    setFormDescription('');
    setFormLesson('');
    setFormStudentId(teacherStudents[0]?.id ?? '');
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
    if (!user?.teacherId || !formTitle || !formStudentId || !selectedModuleId) return;
    const module = modules.find((item) => item.id === selectedModuleId);
    const newProgress = mapStatusToProgress(formStatus);

    if (editingActivity) {
      await updateActivity(editingActivity.id, {
        title: formTitle,
        description: formDescription,
        lesson: formLesson,
        studentId: formStudentId,
        status: formStatus,
        progress: newProgress,
      });
    } else {
      await createActivity({
        title: formTitle,
        description: formDescription,
        lesson: formLesson,
        moduleId: selectedModuleId,
        course: module?.course ?? '',
        studentId: formStudentId,
        teacherId: user.teacherId,
        status: formStatus,
        progress: newProgress,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar esta actividad?')) await deleteActivity(id);
  };

  if (!user?.teacherId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Debes iniciar sesión como docente para ver este tablero.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-slate-900">
              <Building2 size={22} className="text-purple-600" />
              Tablero de Docente
            </h1>
            <p className="text-xs mt-0.5 text-slate-500">Se muestra solo la organización que está asignada a tu usuario real.</p>
          </div>
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            {showPassword ? 'Ocultar' : 'Mostrar'} contraseña
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"><Users size={15} />{teacherStudents.length} alumnos</div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"><Layers size={15} />{teacherGroups.length} grupos</div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"><BookOpen size={15} />{myCourses.length} cursos</div>
        </div>

        {showPassword && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold">Credencial de acceso</p>
            <p className="mt-1">Correo: {user.email}</p>
            <p className="font-mono">Contraseña: 123456</p>
          </div>
        )}

        {loadError && (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle size={16} className="mt-0.5" />
            <p>{loadError}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Centro:</span>
          <select value={selectedCenterId} onChange={(e) => setSelectedCenterId(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200">
            <option value="all">Todos los centros</option>
            {teacherCenters.map((center) => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-400">Si no ves estructura, el usuario no tiene grupos, centro o cursos asignados en la base de datos.</p>
      </div>

      {teacherStudents.length === 0 ? (
        <div className="flex-1 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          <p className="text-sm font-semibold">Aún no tienes alumnos vinculados a este docente.</p>
          <p className="text-xs mt-2">Asigna estudiantes al docente para que aparezca la estructura real.</p>
        </div>
      ) : boardGroups.length === 0 ? (
        <div className="flex-1 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          <p className="text-sm font-semibold">No hay grupos o cursos asignados a esta cuenta.</p>
          <p className="text-xs mt-2">Revisa que el docente tenga estudiantes, grupos y cursos vinculados a la organización.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-x-auto">
          <div className="flex gap-4 pb-4 min-w-[1100px]">
            {boardGroups.map(({ group, courses: groupCourses }) => {
              const center = centers.find((item) => item.id === group.centerId);
              return (
                <div key={group.id} className="w-[32rem] flex flex-col rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                  <div className="rounded-t-3xl border-b border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Grupo</p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">{group.name}</h2>
                    <p className="text-[11px] text-slate-500 mt-1">{center?.name ?? 'Centro no asignado'}</p>
                    {group.programs.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.programs.map((program) => (
                          <span key={program.program} className="rounded-full border border-purple-100 bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700">{program.program}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {groupCourses.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">No hay cursos asignados a este grupo.</div>
                    ) : groupCourses.map(({ course, modules: courseModules }) => (
                      <div key={course.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{courseModules.length} módulos visibles</p>
                          </div>
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-700">Curso</span>
                        </div>
                        <div className="space-y-3 p-4">
                          {courseModules.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">No hay módulos activos para este curso.</div>
                          ) : courseModules.map((module) => {
                            const moduleActivities = activitiesByModule[module.id] ?? [];
                            return (
                              <div key={module.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{module.title}</p>
                                    <p className="text-[11px] text-slate-500 mt-1">{module.lessons} lecciones · {module.duration}</p>
                                  </div>
                                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border border-slate-200">{moduleActivities.length} act.</span>
                                </div>
                                <div className="mt-3 space-y-2">
                                  {moduleActivities.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">Sin actividades</div>
                                  ) : moduleActivities.slice(0, 3).map((activity) => {
                                    const student = students.find((item) => item.id === activity.studentId);
                                    return (
                                      <div key={activity.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                          <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 truncate">{activity.title}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{student?.name ?? 'Sin estudiante'}</p>
                                          </div>
                                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{activity.status}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="mt-3">
                                  <button onClick={() => openCreate(module.id)} className="flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700">
                                    <Plus size={12} /> Añadir actividad
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 min-h-[90px] resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lección</label>
            <input type="text" value={formLesson} onChange={(e) => setFormLesson(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estudiante</label>
            <select value={formStudentId} onChange={(e) => setFormStudentId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200">
              <option value="">Seleccionar</option>
              {teacherStudents.map((student) => (
                <option key={student.id} value={student.id}>{student.name} — {student.group}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as ActivityStatus)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200">
              {ACTIVITY_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button onClick={handleSubmit} className="rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">{editingActivity ? 'Guardar' : 'Crear'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};