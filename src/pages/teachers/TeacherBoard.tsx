import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, Building2, Eye, EyeOff, Layers, Plus, Users, X } from 'lucide-react';
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[90vw] md:max-w-5xl z-10 border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
};

export const TeacherBoard = () => {
  const user = useAuthStore((s) => s.user);
  const activities = useActivityStore((s) => s.activities);
  const loadActivities = useActivityStore((s) => s.loadActivities);
  const loadByTeacher = useActivityStore((s) => s.loadByTeacher);
  const updateActivity = useActivityStore((s) => s.updateActivity);
  const createActivity = useActivityStore((s) => s.createActivity);
  const students = useStudentStore((s) => s.students);
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
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeModuleDetail, setActiveModuleDetail] = useState<{ module: Module; course: Course; group: Group } | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');

  const normalizeString = (value?: string | null) => value?.trim().toLowerCase() ?? '';

  const teacherGroups = useMemo(() => {
    if (!user?.teacherId) return [];

    const normalizedUserName = normalizeString(user.name);

    // Only show groups where the current user is assigned as mentor in the group's programs.
    return groups.filter((group) =>
      Array.isArray(group.programs) && group.programs.some((program) => normalizeString(program.mentor) === normalizedUserName),
    );
  }, [groups, students, user?.name, user?.teacherId]);

  const teacherGroupNames = useMemo(
    () => Array.from(new Set(teacherGroups.map((group) => normalizeString(group.name)).filter(Boolean))),
    [teacherGroups],
  );

  const teacherStudents = useMemo(() => {
    if (!user?.teacherId) return [];
    return students.filter(
      (student) =>
        teacherGroupNames.includes(normalizeString(student.group)) || student.teacherId === user.teacherId,
    );
  }, [students, teacherGroupNames, user?.teacherId]);

  const teacherCenters = useMemo(
    () => centers.filter((center) => teacherGroups.some((group) => group.centerId === center.id)),
    [centers, teacherGroups],
  );

  const visibleGroups = useMemo(() => {
    return teacherGroups.filter((group) => selectedCenterId === 'all' || group.centerId === selectedCenterId);
  }, [selectedCenterId, teacherGroups]);

  const getGroupCenterName = (group: Group): string => {
    return centers.find((center) => center.id === group.centerId)?.name ?? '';
  };

  // Get the specific programs assigned to THIS teacher in this group
  const getTeacherAssignedPrograms = (group: Group): string[] => {
    if (!user?.name) return [];
    const normalizedUserName = normalizeString(user.name);
    return group.programs
      .filter((program) => normalizeString(program.mentor) === normalizedUserName)
      .map((program) => normalizeString(program.program))
      .filter(Boolean);
  };

  // Check if course belongs ONLY to the teacher's assigned programs
  const isCourseInTeacherPrograms = (course: Course, group: Group): boolean => {
    const assignedPrograms = getTeacherAssignedPrograms(group);
    if (assignedPrograms.length === 0) return false;

    const title = normalizeString(course.title);
    const centerName = normalizeString(getGroupCenterName(group));

    return assignedPrograms.some((program) => 
      title.includes(program) && title.includes(centerName)
    );
  };

  const openModuleDetail = (module: Module, course: Course, group: Group) => {
    setActiveModuleDetail({ module, course, group });
    setSelectedActivityId('');
  };

  const closeModuleDetail = () => {
    setActiveModuleDetail(null);
    setSelectedActivityId('');
  };

  const getStudentName = (studentId?: string | null) => {
    return students.find((student) => student.id === studentId)?.name ?? 'Sin estudiante';
  };

  const getStudentById = (studentId?: string | null) => {
    return students.find((student) => student.id === studentId) ?? null;
  };

  const relevantTeacherActivities = useMemo(
    () => (user?.teacherId ? activities.filter((activity) => activity.teacherId === user.teacherId) : activities),
    [activities, user?.teacherId],
  );

  const boardGroups = useMemo(() => {
    return visibleGroups
      .map((group) => ({
        group,
        courses: courses
          .filter((course) => isCourseInTeacherPrograms(course, group))
          .map((course) => ({
            course,
            // CAMBIO: Mostrar TODOS los módulos del curso, sin filtro de estado
            modules: modules.filter((module) => module.course === course.title),
          })),
      }))
      // CAMBIO: Mostrar grupos aunque sus cursos no tengan módulos
      // (Los cursos seguirán filtrándose por programas asignados)
      .filter((item) => item.courses.length > 0);
  }, [courses, modules, visibleGroups, user?.name]);


  const myCourses = useMemo(
    () => courses.filter((course) => boardGroups.some((entry) => entry.courses.some((item) => item.course.id === course.id))),
    [boardGroups, courses],
  );

  const activitiesByModule = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    modules.forEach((module) => {
      map[module.id] = relevantTeacherActivities.filter((activity) => activity.moduleId === module.id);
    });
    return map;
  }, [modules, relevantTeacherActivities]);

  useEffect(() => {
    const load = async () => {
      setLoadError(null);
      try {
        const [modulesData, coursesData, groupsData, centersData] = await Promise.all([
          getModulesRequest(), // Cargar TODOS los módulos sin filtro de teacherId
          getCoursesRequest(),
          getGroupsRequest(user?.teacherId ? { teacherId: user.teacherId } : undefined),
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

    const loadData = async () => {
      await load();
      loadStudents();
      if (user?.teacherId) {
        await loadByTeacher(user.teacherId);
      } else {
        await loadActivities();
      }
    };

    loadData();
  }, [loadActivities, loadByTeacher, loadStudents, user?.teacherId]);

  const openCreate = (moduleId: string) => {
    setEditingActivity(null);
    setSelectedModuleId(moduleId);
    setFormTitle('');
    setFormDescription('');
    setFormLesson('');
    setFormStudentId(teacherStudents[0]?.id ?? '');
    setFormStatus('Pendiente');
    setFormAttachmentName('');
    setFormAttachmentUrl('');
    setModalOpen(true);
  };

  const openEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setSelectedModuleId(activity.moduleId);
    setFormTitle(activity.title);
    setFormDescription(activity.description);
    setFormLesson(activity.lesson);
    setFormStudentId(activity.studentId);
    setFormStatus(activity.status);
    setFormAttachmentName(activity.attachmentName ?? '');
    setFormAttachmentUrl(activity.attachmentUrl ?? '');
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
        attachmentName: formAttachmentName,
        attachmentUrl: formAttachmentUrl,
      });
      await loadByTeacher(user.teacherId);
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
        attachmentName: formAttachmentName,
        attachmentUrl: formAttachmentUrl,
      });
      await loadByTeacher(user.teacherId);
    }
    setModalOpen(false);
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-purple-700">
            Todos los cursos
          </span>
          <select value={selectedCenterId} onChange={(e) => setSelectedCenterId(e.target.value)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-200">
            <option value="all">Todos los centros</option>
            {teacherCenters.map((center) => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-400">Solo se muestran los centros que tienen grupos asignados a tu usuario.</p>
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
              const groupStudents = teacherStudents.filter((student) => student.group === group.name);
              return (
                <div key={group.id} className="min-w-[32rem] flex flex-col rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                  <div className="rounded-t-3xl border-b border-slate-200 bg-white px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Centro</p>
                        <h2 className="mt-2 text-lg font-semibold text-slate-900">{center?.name ?? 'Centro no asignado'}</h2>
                        <p className="text-[11px] text-slate-500 mt-1">{group.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Estudiantes</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{groupStudents.length}</p>
                      </div>
                    </div>
                    {group.programs.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.programs.map((program) => (
                          <span key={program.program} className="rounded-full border border-purple-100 bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700">{program.program}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto p-4">
                    <div className="flex gap-4 min-w-[30rem]">
                      {groupCourses.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No hay cursos asignados a este grupo.</div>
                      ) : groupCourses.map(({ course, modules: courseModules }) => (
                        <div key={course.id} className="min-w-[24rem] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
                          <div className="rounded-t-3xl border-b border-slate-100 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Curso</p>
                            <h3 className="mt-2 text-base font-semibold text-slate-900">{course.title}</h3>
                            <p className="text-[11px] text-slate-400 mt-1">{courseModules.length} módulos activos</p>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                                  <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between gap-3">
                                    <span>{groupStudents.filter((student) => student.group === group.name).length} alumnos en el grupo</span>
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">{moduleActivities.some((activity) => activity.studentSubmissionStatus === 'ENTREGADO' || activity.studentSubmissionStatus === 'FINALIZADO') ? 'Entregas pendientes' : 'Sin entregas'}</span>
                                  </div>
                                  <div className="mt-3 space-y-2">
                                    {moduleActivities.length === 0 ? (
                                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">Sin actividades</div>
                                    ) : moduleActivities.slice(0, 3).map((activity) => (
                                      <div key={activity.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                          <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 truncate">{activity.title}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{getStudentName(activity.studentId)}</p>
                                          </div>
                                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{activity.studentSubmissionStatus ?? 'SIN_INICIAR'}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <button onClick={() => openCreate(module.id)} className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700">
                                      <Plus size={12} /> Añadir actividad
                                    </button>
                                    <button onClick={() => openModuleDetail(module, course, group)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                      <Eye size={12} /> Ver módulo
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal isOpen={!!activeModuleDetail} onClose={closeModuleDetail} title={activeModuleDetail ? `Módulo: ${activeModuleDetail.module.title}` : ''}>
        {activeModuleDetail ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Curso</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{activeModuleDetail.course.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Grupo: {activeModuleDetail.group.name}</p>
              <p className="text-[11px] text-slate-500 mt-1">Centro: {centers.find((item) => item.id === activeModuleDetail.group.centerId)?.name ?? 'No asignado'}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Alumnos del módulo</p>
                  <p className="text-xs text-slate-500 mt-1">Estado de actividad y entrega por alumno.</p>
                </div>
                <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 border border-slate-200">
                  {teacherStudents.filter((student) => student.group === activeModuleDetail.group.name).length} alumnos
                </span>
              </div>
              <div className="mt-3 space-y-2 max-h-[260px] overflow-y-auto">
                {teacherStudents.filter((student) => student.group === activeModuleDetail.group.name).map((student) => {
                  const studentActivity = (activitiesByModule[activeModuleDetail.module.id] ?? []).find((activity) => activity.studentId === student.id);
                  return (
                    <div key={student.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{student.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{student.email ?? 'Sin email'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-right">
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 border border-slate-200">
                            {studentActivity?.studentSubmissionStatus ?? 'SIN_INICIAR'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {studentActivity ? studentActivity.status : 'Sin actividad asignada'}
                          </span>
                        </div>
                      </div>
                      {studentActivity ? (
                        <p className="mt-2 text-[11px] text-slate-500">Actividad: {studentActivity.title}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              {/* LEFT: Lista de Actividades */}
              <div className="space-y-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Actividades</p>
                      <p className="text-xs text-slate-500 mt-1">Selecciona una para ver entregas</p>
                    </div>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 border border-slate-200">{activitiesByModule[activeModuleDetail.module.id]?.length ?? 0}</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {(activitiesByModule[activeModuleDetail.module.id] ?? []).map((activity) => {
                    const selected = selectedActivityId === activity.id;
                    return (
                      <button
                        key={activity.id}
                        onClick={() => setSelectedActivityId(activity.id)}
                        className={`w-full text-left rounded-2xl border transition-all ${
                          selected ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-white hover:border-slate-300'
                        } p-3`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 text-sm truncate">{activity.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
                            <p className="text-[11px] text-slate-500 mt-1">Alumno: {getStudentName(activity.studentId)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] whitespace-nowrap ${
                              activity.status === 'Aprobada' 
                                ? 'bg-green-100 text-green-700' 
                                : activity.status === 'En revisión'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {activity.status}
                            </span>
                            <span className="rounded-full bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600 border border-slate-200">
                              {activity.studentSubmissionStatus ?? 'SIN_INICIAR'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEditActivity(activity)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Editar
                          </button>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Detalles de Actividad + Entregas */}
              <div className="space-y-3">
                {selectedActivityId ? (
                  <>
                    {(() => {
                      const selectedActivity = (activitiesByModule[activeModuleDetail.module.id] ?? []).find(
                        (a) => a.id === selectedActivityId
                      );
                      if (!selectedActivity) return null;

                      const student = getStudentById(selectedActivity.studentId);
                      const submissionStatus = selectedActivity.studentSubmissionStatus ?? 'SIN_INICIAR';
                      const hasSubmitted = submissionStatus === 'ENTREGADO' || submissionStatus === 'FINALIZADO';

                      return (
                        <>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.16em]">Detalles de la actividad</p>
                            <div className="mt-3 space-y-3 text-sm text-slate-700">
                              <div>
                                <p className="font-semibold text-slate-900">Nombre</p>
                                <p className="mt-1 text-slate-600">{selectedActivity.title}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">Descripción</p>
                                <p className="mt-1 text-slate-600">{selectedActivity.description || 'Sin descripción'}</p>
                              </div>
                              {selectedActivity.lesson && (
                                <div>
                                  <p className="font-semibold text-slate-900">Lección</p>
                                  <p className="mt-1 text-slate-600">{selectedActivity.lesson}</p>
                                </div>
                              )}
                              {selectedActivity.attachmentName ? (
                                <div className="rounded-2xl border border-slate-200 bg-white p-3 mt-3">
                                  <p className="font-semibold text-slate-900">Material docente</p>
                                  <a
                                    href={selectedActivity.attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-block text-purple-600 underline text-sm truncate"
                                  >
                                    📎 {selectedActivity.attachmentName}
                                  </a>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">Estado de entrega</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Entrega</p>
                                <p className="mt-1 font-semibold text-slate-900">{submissionStatus}</p>
                              </div>
                              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Progreso</p>
                                <p className="mt-1 font-semibold text-slate-900">{selectedActivity.progress}%</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="text-sm font-semibold text-slate-900">Material de entrega</p>
                            <div className="mt-3 text-sm text-slate-700 space-y-3">
                              {hasSubmitted ? (
                                <>
                                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="font-semibold text-slate-900">Mensaje del estudiante</p>
                                    <p className="mt-1 text-slate-600">{selectedActivity.studentSubmissionText || 'Sin mensaje'}</p>
                                  </div>
                                  {selectedActivity.studentSubmissionAttachmentName ? (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                      <p className="font-semibold text-slate-900">Adjunto</p>
                                      <a
                                        href={selectedActivity.studentSubmissionAttachmentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 inline-block text-purple-600 underline text-sm"
                                      >
                                        📎 {selectedActivity.studentSubmissionAttachmentName}
                                      </a>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-slate-500">No hay archivo adjunto</p>
                                  )}
                                </>
                              ) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                                  No se ha registrado una entrega todavía.
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 text-xs">
                            {selectedActivity.studentSubmissionStatus !== 'FINALIZADO' && (
                              <button
                                onClick={async () => {
                                  await updateActivity(selectedActivity.id, {
                                    studentSubmissionStatus: 'FINALIZADO',
                                  });
                                  if (user?.teacherId) {
                                    await loadByTeacher(user.teacherId);
                                  }
                                }}
                                className="flex-1 rounded-lg bg-green-100 text-green-700 font-semibold py-2 hover:bg-green-200 transition-colors"
                              >
                                ✓ Aprobar entrega
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                await updateActivity(selectedActivity.id, {
                                  studentSubmissionStatus: 'EN_PROCESO',
                                });
                                if (user?.teacherId) {
                                  await loadByTeacher(user.teacherId);
                                }
                              }}
                              className="flex-1 rounded-lg bg-amber-100 text-amber-700 font-semibold py-2 hover:bg-amber-200 transition-colors"
                            >
                              ↶ Devolver para corrección
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    <p className="text-sm font-semibold">Selecciona una actividad</p>
                    <p className="text-xs mt-1">para ver los detalles y la entrega</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Archivo adjunto del docente</label>
            <input type="file" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                setFormAttachmentName(file.name);
                setFormAttachmentUrl(reader.result as string);
              };
              reader.readAsDataURL(file);
            }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
            {formAttachmentName ? (
              <p className="mt-2 text-sm text-slate-500">Archivo: {formAttachmentName}</p>
            ) : null}
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