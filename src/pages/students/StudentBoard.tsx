import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AlertTriangle, BookOpen, Building2, Lock, Unlock, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useActivityStore from '../../store/activityStore';
import useStudentStore from '../../store/studentStore';
import { getCentersRequest } from '../../services/centerService';
import { getCoursesRequest } from '../../services/courseService';
import { getGroupsRequest } from '../../services/groupService';
import { getModulesRequest } from '../../services/moduleService';
import type { Activity, ActivitySubmissionStatus } from '../../types/activity.types';
import type { Center } from '../../types/center.types';
import type { Course } from '../../types/course.types';
import type { Group } from '../../types/group.types';
import type { Module } from '../../types/module.types';
import { isActivityVisibleToStudent } from '../../utils/activityVisibility';

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[90vw] md:max-w-3xl z-10 border border-slate-100">
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

export const StudentBoard = () => {
  const user = useAuthStore((s) => s.user);
  const activities = useActivityStore((s) => s.activities);
  const loadByStudent = useActivityStore((s) => s.loadByStudent);
  const updateActivity = useActivityStore((s) => s.updateActivity);
  const updateActivitySubmission = useActivityStore((s) => s.updateActivitySubmission);
  const students = useStudentStore((s) => s.students);
  const loadStudents = useStudentStore((s) => s.loadStudents);

  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [submissionText, setSubmissionText] = useState('');
  const [submissionAttachmentName, setSubmissionAttachmentName] = useState('');
  const [submissionAttachmentUrl, setSubmissionAttachmentUrl] = useState('');
  const [isAttachmentLoading, setIsAttachmentLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  const currentStudent = useMemo(() => {
    if (user?.studentId) {
      return students.find((student) => student.id === user.studentId) ?? null;
    }
    if (!user?.email) return null;
    return students.find((student) => student.email.toLowerCase() === user.email.toLowerCase()) ?? null;
  }, [students, user?.email, user?.studentId]);

  const currentGroup = useMemo(() => {
    if (!currentStudent) return null;
    return groups.find((group) => group.name === currentStudent.group) ?? null;
  }, [currentStudent, groups]);

  const currentCenter = useMemo(() => {
    if (currentStudent?.centerId) {
      return centers.find((center) => center.id === currentStudent.centerId) ?? null;
    }
    if (!currentGroup) return null;
    return centers.find((center) => center.id === currentGroup.centerId) ?? null;
  }, [currentGroup, currentStudent?.centerId, centers]);

  const normalizeString = (value?: string | null) => value?.trim().toLowerCase() ?? '';

  const assignedCourses = useMemo(() => {
    if (!currentStudent || !currentGroup) return [];
    const groupName = normalizeString(currentStudent.group);
    const centerName = normalizeString(currentCenter?.name ?? currentGroup.name.split(' - ')[0] ?? '');

    return courses.filter((course) => {
      const title = normalizeString(course.title);
      const courseCenter = title.split(' - ')[0];
      const groupMatch = course.groups.some((groupNameRef) => normalizeString(groupNameRef) === groupName);
      const programMatch = (currentGroup.programs ?? []).some((assignment) => {
        const program = normalizeString(assignment.program);
        return program.length > 0 && title.includes(program) && courseCenter === centerName;
      });
      return groupMatch || programMatch;
    });
  }, [courses, currentCenter?.name, currentGroup, currentStudent]);

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
    if (currentStudent?.id) {
      loadByStudent(currentStudent.id, {
        group: currentGroup?.name,
        program: currentStudent.program,
      });
    }
  }, [currentGroup?.name, currentStudent?.id, currentStudent?.program, loadByStudent, loadStudents]);

  const assignedModules = useMemo(() => {
    const courseTitles = assignedCourses.map((course) => course.title);
    return modules.filter((module) => courseTitles.includes(module.course) && module.status === 'Activo');
  }, [assignedCourses, modules]);

  const modulesByCourse = useMemo(() => {
    const map: Record<string, Module[]> = {};
    assignedModules.forEach((module) => {
      if (!map[module.course]) map[module.course] = [];
      map[module.course].push(module);
    });
    return map;
  }, [assignedModules]);

  const myActivities = useMemo(() => {
    if (!currentStudent?.id) return [];

    const visibleActivities = activities.filter((activity) => {
      const matchingCourse = assignedCourses.find((course) => course.title === activity.course);
      const matchingGroup = groups.find((group) => group.name === currentStudent.group);
      return isActivityVisibleToStudent(activity, currentStudent, matchingCourse ?? null, matchingGroup ?? null);
    });

    return visibleActivities;
  }, [activities, assignedCourses, currentStudent, groups]);

  const activitiesByModule = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    myActivities.forEach((activity) => {
      if (!map[activity.moduleId]) map[activity.moduleId] = [];
      map[activity.moduleId].push(activity);
    });
    return map;
  }, [myActivities]);

  const selectedActivity = useMemo(() => {
    return myActivities.find((activity) => activity.id === selectedActivityId) ?? null;
  }, [myActivities, selectedActivityId]);

  const linkifyText = (text: string) => {
    const urlRegex = /(https?:\/\/[\w-]+(\.[\w-]+)+(\/[\w\d@:%_\+.~#?&//=;-]*)?)/gi;
    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a key={`${part}-${index}`} href={part} target="_blank" rel="noreferrer" className="text-purple-600 underline">
            {part}
          </a>
        );
      }
      return <span key={`${part}-${index}`}>{part}</span>;
    });
  };

  const handleSubmissionFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAttachmentLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setSubmissionAttachmentName(file.name);
      setSubmissionAttachmentUrl(reader.result as string);
      setIsAttachmentLoading(false);
    };
    reader.onerror = () => {
      console.error('Error leyendo el archivo de envío');
      setIsAttachmentLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const openSubmissionFilePicker = () => {
    attachmentInputRef.current?.click();
  };

  const clearSubmissionAttachment = () => {
    setSubmissionAttachmentName('');
    setSubmissionAttachmentUrl('');
  };

  const hasSubmissionContent = () => {
    return submissionText.trim().length > 0 || submissionAttachmentUrl.trim().length > 0;
  };

  const openActivityDetail = (activityId: string) => {
    const activity = myActivities.find((item) => item.id === activityId);
    if (!activity) return;
    setSelectedActivityId(activityId);
    setSubmissionText(activity.studentSubmissionText ?? '');
    setSubmissionAttachmentName(activity.studentSubmissionAttachmentName ?? '');
    setSubmissionAttachmentUrl(activity.studentSubmissionAttachmentUrl ?? '');
    setActivityModalOpen(true);
  };

  const closeActivityModal = () => {
    setActivityModalOpen(false);
    setSelectedActivityId('');
    setSubmissionText('');
    setSubmissionAttachmentName('');
    setSubmissionAttachmentUrl('');
    setSubmissionError('');
  };

  const handleSubmitActivity = async () => {
    if (!selectedActivity || !currentStudent?.id) return;
    if (!hasSubmissionContent()) {
      setSubmissionError('Debes escribir tu entrega o seleccionar un archivo para enviar. El archivo es opcional.');
      return;
    }
    setSubmissionError('');
    setIsSubmitting(true);
    try {
      await updateActivitySubmission(selectedActivity.id, {
        studentSubmissionStatus: 'FINALIZADO',
        studentSubmissionText: submissionText,
        studentSubmissionAttachmentUrl: submissionAttachmentUrl,
        studentSubmissionAttachmentName: submissionAttachmentName,
      });
      // El store ya actualiza la actividad localmente; evitar recargar filtrada por studentId
      closeActivityModal();
    } catch (error) {
      console.error('Error al enviar la entrega', error);
      const message = error instanceof Error ? error.message : String(error);
      setSubmissionError(`No se pudo enviar la entrega. ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraftActivity = async () => {
    if (!selectedActivity || !currentStudent?.id) return;
    setSubmissionError('');
    setIsSubmitting(true);
    try {
      await updateActivitySubmission(selectedActivity.id, {
        studentSubmissionStatus: 'EN_PROCESO',
        studentSubmissionText: submissionText,
        studentSubmissionAttachmentUrl: submissionAttachmentUrl,
        studentSubmissionAttachmentName: submissionAttachmentName,
      });
      // El store ya actualiza la actividad localmente; evitar recargar filtrada por studentId
      closeActivityModal();
    } catch (error) {
      console.error('Error al guardar borrador', error);
      const message = error instanceof Error ? error.message : String(error);
      setSubmissionError(`No se pudo guardar el borrador. ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const unlockedModules = useMemo(() => {
    const unlocked: Record<string, boolean> = {};
    Object.values(modulesByCourse).forEach((courseModules) => {
      courseModules.forEach((module, index) => {
        if (index === 0) {
          unlocked[module.id] = true;
        } else {
          const prev = courseModules[index - 1];
          const prevActivities = activitiesByModule[prev.id] ?? [];
          // The module unlocks when the previous module has at least one approved activity,
          // or when the previous module has no activities assigned.
          unlocked[module.id] = prevActivities.length === 0 || prevActivities.some((activity) => activity.status === 'Aprobada');
        }
      });
    });
    return unlocked;
  }, [activitiesByModule, modulesByCourse]);

  const stats = useMemo(() => ({
    total: myActivities.length,
    pendiente: myActivities.filter((activity) => activity.status === 'Pendiente').length,
    enRevision: myActivities.filter((activity) => activity.status === 'En revisión').length,
    aprobada: myActivities.filter((activity) => activity.status === 'Aprobada').length,
    progress: myActivities.length > 0 ? Math.round(myActivities.reduce((sum, activity) => sum + activity.progress, 0) / myActivities.length) : 0,
  }), [myActivities]);

  if (!currentStudent) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
          <p className="text-sm font-semibold text-slate-900">No se encontró tu perfil de estudiante.</p>
          <p className="text-xs mt-1 text-slate-400">Tu usuario debe estar ligado a un estudiante real en la base de datos.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col gap-4 min-h-0">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-slate-900">
            <Building2 size={22} className="text-purple-600" />
            Mi Tablero
          </h1>
          <p className="text-xs mt-1 text-slate-500">Centro: {currentCenter?.name ?? 'No asignado'} · Grupo: {currentStudent.group || 'No asignado'}</p>
          {loadError && (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle size={16} className="mt-0.5" />
              <p>{loadError}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Progreso', value: `${stats.progress}%`, color: '#7c3aed' },
            { label: 'Actividades', value: stats.total, color: '#0f172a' },
            { label: 'Pendientes', value: stats.pendiente, color: '#f59e0b' },
            { label: 'Aprobadas', value: stats.aprobada, color: '#059669' },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-extrabold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {!currentGroup ? (
          <div className="flex-1 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            <p className="text-sm font-semibold">Tu estudiante no tiene grupo asignado.</p>
            <p className="text-xs mt-2">El tablero solo se mostrará cuando exista un grupo y un centro vinculado a tu cuenta.</p>
          </div>
        ) : Object.keys(modulesByCourse).length === 0 ? (
          <div className="flex-1 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No hay cursos o módulos asignados a tu grupo.</p>
            <p className="text-xs mt-2">Revisa que el grupo tenga cursos y módulos vinculados en la organización.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-x-auto">
            <div className="flex gap-4 pb-4 min-w-[1100px]">
              {Object.entries(modulesByCourse).map(([courseTitle, courseModules]) => (
                <div key={courseTitle} className="w-[26rem] flex flex-col rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                  <div className="rounded-t-3xl border-b border-slate-200 bg-white px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Curso</p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">{courseTitle}</h2>
                    <p className="text-[11px] text-slate-400 mt-1">{courseModules.length} módulos activos</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {courseModules.map((module) => {
                      const moduleActivities = activitiesByModule[module.id] ?? [];
                      const unlocked = unlockedModules[module.id] ?? false;
                      return (
                        <div key={module.id} className={`rounded-3xl border ${unlocked ? 'border-slate-200 bg-white' : 'border-slate-200/70 bg-slate-100 opacity-80'}`}>
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{module.title}</p>
                                <p className="text-[11px] text-slate-500 mt-1">{module.lessons} lecciones · {module.duration}</p>
                              </div>
                              {unlocked ? <Unlock size={14} className="text-purple-500" /> : <Lock size={14} className="text-slate-400" />}
                            </div>
                            <div className="mt-4 space-y-2">
                              {moduleActivities.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">Sin actividades en este módulo.</div>
                              ) : moduleActivities.map((activity) => (
                                <div key={activity.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                  <div className="flex flex-col gap-3 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 truncate">{activity.title}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{activity.lesson}</p>
                                      </div>
                                      <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{activity.status}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-[11px] text-slate-500">Entrega: {activity.studentSubmissionStatus ?? 'SIN_INICIAR'}</span>
                                      <button
                                        onClick={() => openActivityDetail(activity.id)}
                                        disabled={!unlocked}
                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${unlocked ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                                      >
                                        {activity.studentSubmissionStatus === 'ENTREGADO' || activity.studentSubmissionStatus === 'FINALIZADO' ? 'Ver entrega' : 'Abrir actividad'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {!unlocked && (
                              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-100 p-3 text-sm text-slate-500">Este módulo está bloqueado hasta aprobar el anterior.</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={activityModalOpen} onClose={closeActivityModal} title={selectedActivity ? selectedActivity.title : 'Actividad'}>
        {selectedActivity ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Actividad</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{selectedActivity.title}</h3>
              <div className="mt-2 text-sm text-slate-600 space-y-2">
                {selectedActivity.description ? (
                  <p>{linkifyText(selectedActivity.description)}</p>
                ) : (
                  <p>Sin descripción</p>
                )}
                {selectedActivity.lesson && (
                  <p className="text-sm text-slate-500">Lección: {selectedActivity.lesson}</p>
                )}
              </div>
              {selectedActivity.attachmentName ? (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Material adjunto del docente</p>
                  <a href={selectedActivity.attachmentUrl} target="_blank" rel="noreferrer" className="mt-1 block text-purple-600 underline truncate">
                    {selectedActivity.attachmentName}
                  </a>
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1">Estado: {selectedActivity.status}</span>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1">Entrega: {selectedActivity.studentSubmissionStatus ?? 'SIN_INICIAR'}</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-4">
              <div>
                <p className="font-semibold text-slate-900">Tu entrega</p>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={6}
                  placeholder="Describe aquí tu entrega o incluye un enlace a tu trabajo"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Archivo adjunto</label>
                <button
                  type="button"
                  onClick={openSubmissionFilePicker}
                  className="mt-3 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Adjuntar archivo
                </button>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  onChange={handleSubmissionFileChange}
                  className="hidden"
                />
                {isAttachmentLoading ? (
                  <p className="mt-2 text-sm text-slate-500">Cargando archivo...</p>
                ) : submissionAttachmentName ? (
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">Archivo seleccionado</p>
                        <p className="truncate">{submissionAttachmentName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={clearSubmissionAttachment}
                        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : null}
                {submissionError ? (
                  <p className="text-sm text-rose-600">{submissionError}</p>
                ) : (
                  <p className="text-sm text-slate-500">Puedes enviar tu entrega solo con texto; el adjunto es opcional.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button onClick={closeActivityModal} className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">Cancelar</button>
              <button
                onClick={handleSaveDraftActivity}
                disabled={isSubmitting}
                className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Guardar borrador
              </button>
              <button
                onClick={handleSubmitActivity}
                disabled={isSubmitting}
                className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {selectedActivity.studentSubmissionStatus === 'ENTREGADO' || selectedActivity.studentSubmissionStatus === 'FINALIZADO' ? 'Reenviar entrega' : 'Enviar entrega'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No se encontró la actividad seleccionada.</p>
        )}
      </Modal>
    </>
  );
};