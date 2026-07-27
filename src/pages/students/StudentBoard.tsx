import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle, Clock, AlertCircle, Circle, FileText, Lock, Unlock, LayoutGrid } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useActivityStore from '../../store/activityStore';
import useStudentStore from '../../store/studentStore';
import { getModulesRequest } from '../../services/moduleService';
import { getCoursesRequest } from '../../services/courseService';
import { GROUPS, getCoursesForGroup } from '../../services/sharedMockDb';
import type { Module } from '../../types/module.types';
import type { Course } from '../../types/course.types';
import type { ActivityStatus } from '../../types/activity.types';

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

export const StudentBoard = () => {
  const user = useAuthStore((s) => s.user);
  const activities = useActivityStore((s) => s.activities);
  const loadByStudent = useActivityStore((s) => s.loadByStudent);
  const students = useStudentStore((s) => s.students);

  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Encontrar el estudiante actual por email
  const currentStudent = useMemo(() => {
    if (!user?.email) return null;
    return students.find((s) => s.email.toLowerCase() === user.email.toLowerCase());
  }, [user?.email, students]);

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
    if (currentStudent?.id) {
      loadByStudent(currentStudent.id);
    }
  }, [currentStudent?.id, loadByStudent]);

  // Cursos del estudiante (a través de su grupo)
  const myCourses = useMemo(() => {
    if (!currentStudent) return [];
    const group = GROUPS.find((g) => g.name === currentStudent.group);
    if (!group) return [];
    const courseIds = getCoursesForGroup(group.id);
    return courses.filter((c) => courseIds.includes(c.id));
  }, [courses, currentStudent]);

  // Módulos publicados de mis cursos
  const myModules = useMemo(() => {
    const courseTitles = myCourses.map((c) => c.title);
    return modules.filter((m) => courseTitles.includes(m.course) && m.status === 'Activo');
  }, [modules, myCourses]);

  // Módulos agrupados por curso
  const modulesByCourse = useMemo(() => {
    const map: Record<string, Module[]> = {};
    myModules.forEach((mod) => {
      if (!map[mod.course]) map[mod.course] = [];
      map[mod.course].push(mod);
    });
    return map;
  }, [myModules]);

  // Mis actividades
  const myActivities = useMemo(() => {
    if (!currentStudent?.id) return [];
    return activities.filter((a) => a.studentId === currentStudent.id);
  }, [activities, currentStudent?.id]);

  // Actividades por módulo
  const activitiesByModule = useMemo(() => {
    const map: Record<string, typeof myActivities> = {};
    myActivities.forEach((a) => {
      if (!map[a.moduleId]) map[a.moduleId] = [];
      map[a.moduleId].push(a);
    });
    return map;
  }, [myActivities]);

  // Módulos desbloqueados (el anterior debe tener todas las actividades aprobadas)
  const isModuleUnlocked = useMemo(() => {
    const unlocked: Record<string, boolean> = {};
    Object.entries(modulesByCourse).forEach(([, courseModules]) => {
      courseModules.forEach((mod, index) => {
        if (index === 0) {
          unlocked[mod.id] = true;
        } else {
          const prevMod = courseModules[index - 1];
          const prevActivities = activitiesByModule[prevMod.id] ?? [];
          const allApproved = prevActivities.length > 0 && prevActivities.every((a) => a.status === 'Aprobada');
          unlocked[mod.id] = allApproved;
        }
      });
    });
    return unlocked;
  }, [modulesByCourse, activitiesByModule]);

  const stats = useMemo(() => ({
    total: myActivities.length,
    pendiente: myActivities.filter((a) => a.status === 'Pendiente').length,
    enRevision: myActivities.filter((a) => a.status === 'En revisión').length,
    aprobada: myActivities.filter((a) => a.status === 'Aprobada').length,
    progress: myActivities.length > 0
      ? Math.round(myActivities.reduce((sum, a) => sum + a.progress, 0) / myActivities.length)
      : 0,
  }), [myActivities]);

  if (!currentStudent) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
          <p className="text-sm font-semibold text-slate-900">No se encontró tu perfil de estudiante</p>
          <p className="text-xs mt-1 text-slate-400">Contacta al administrador para asignarte a un grupo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-slate-900">
          <LayoutGrid size={22} className="text-purple-600" />
          Mi Tablero de Trabajo
        </h1>
        <p className="text-xs mt-0.5 text-slate-400">
          {user?.name?.split(' ')[0] ?? 'Estudiante'} — Grupo: {currentStudent.group}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Progreso', value: `${stats.progress}%`, color: '#7c3aed' },
          { label: 'Actividades', value: stats.total, color: '#0f172a' },
          { label: 'Pendientes', value: stats.pendiente, color: '#f59e0b' },
          { label: 'Aprobadas', value: stats.aprobada, color: '#059669' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-slate-100 text-center">
            <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] font-medium mt-0.5 text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-2">
          {Object.entries(modulesByCourse).length === 0 ? (
            <div className="flex items-center justify-center w-full">
              <div className="text-center py-16 text-slate-400">
                <BookOpen size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No hay cursos asignados a tu grupo</p>
              </div>
            </div>
          ) : (
            Object.entries(modulesByCourse).map(([courseTitle, courseModules]) => (
              <div key={courseTitle} className="w-80 flex flex-col rounded-2xl flex-shrink-0 bg-slate-100 border border-slate-200" style={{ maxHeight: '100%' }}>
                <div className="px-3 py-3 flex-shrink-0 border-b border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-600 flex-shrink-0" />
                    <h2 className="text-sm font-bold text-slate-900 truncate">{courseTitle}</h2>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{courseModules.length} módulos</p>
                </div>
                <div className="px-2 pb-2 flex-1 overflow-y-auto space-y-2 pt-2">
                  {courseModules.map((mod) => {
                    const modActivities = activitiesByModule[mod.id] ?? [];
                    const unlocked = isModuleUnlocked[mod.id] ?? false;
                    const allApproved = modActivities.length > 0 && modActivities.every((a) => a.status === 'Aprobada');
                    return (
                      <div key={mod.id} className={`rounded-xl border transition-all ${unlocked ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/50 opacity-60'}`}>
                        <div className="px-3 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            {unlocked ? (
                              allApproved ? <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                                : <Unlock size={14} className="text-purple-500 flex-shrink-0" />
                            ) : <Lock size={14} className="text-slate-300 flex-shrink-0" />}
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold truncate ${unlocked ? 'text-slate-900' : 'text-slate-400'}`}>{mod.title}</p>
                              <p className="text-[10px] text-slate-400">{mod.lessons} lecciones</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 flex-shrink-0 ml-2">{modActivities.length}</span>
                        </div>
                        {unlocked && modActivities.length > 0 && (
                          <div className="px-3 pb-3 space-y-1.5">
                            {modActivities.map((activity) => (
                              <div key={activity.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      {statusIcon[activity.status]}
                                      <p className="text-xs font-semibold text-slate-900 truncate">{activity.title}</p>
                                    </div>
                                    {activity.lesson && <p className="text-[10px] text-purple-600 mt-0.5">📖 {activity.lesson}</p>}
                                    {activity.description && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{activity.description}</p>}
                                  </div>
                                  <div className="text-right flex-shrink-0"><p className="text-xs font-bold text-purple-600">{activity.progress}%</p></div>
                                </div>
                                <div className="mt-1.5 flex items-center justify-between">
                                  <span className={`text-[8px] font-bold uppercase px-1 py-0.5 rounded-full border ${statusStyle[activity.status]}`}>{activity.status}</span>
                                  {activity.attachmentName && <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><FileText size={9} /> {activity.attachmentName}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {unlocked && modActivities.length === 0 && (
                          <div className="px-3 pb-3"><div className="rounded-lg border border-dashed border-slate-300 py-4 text-center text-[10px] text-slate-400">Sin actividades</div></div>
                        )}
                        {!unlocked && (
                          <div className="px-3 pb-3"><div className="rounded-lg bg-slate-100 py-3 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1"><Lock size={10} /> Completa el módulo anterior</div></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};