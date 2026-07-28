import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, Building2, LayoutGrid, Lock, Unlock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useActivityStore from '../../store/activityStore';
import useStudentStore from '../../store/studentStore';
import { getCentersRequest } from '../../services/centerService';
import { getCoursesRequest } from '../../services/courseService';
import { getGroupsRequest } from '../../services/groupService';
import { getModulesRequest } from '../../services/moduleService';
import type { Activity } from '../../types/activity.types';
import type { Center } from '../../types/center.types';
import type { Course } from '../../types/course.types';
import type { Group } from '../../types/group.types';
import type { Module } from '../../types/module.types';

export const StudentBoard = () => {
  const user = useAuthStore((s) => s.user);
  const activities = useActivityStore((s) => s.activities);
  const loadByStudent = useActivityStore((s) => s.loadByStudent);
  const students = useStudentStore((s) => s.students);
  const loadStudents = useStudentStore((s) => s.loadStudents);

  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

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
      loadByStudent(currentStudent.id);
    }
  }, [currentStudent?.id, loadByStudent, loadStudents]);

  const assignedCourses = useMemo(() => {
    if (!currentStudent || !currentGroup) return [];
    return courses.filter((course) => {
      const title = course.title.toLowerCase();
      const groupMatch = course.groups.some((groupName) => groupName.toLowerCase() === currentStudent.group.toLowerCase());
      const programMatch = currentGroup.programs.some((assignment) => title.includes(assignment.program.toLowerCase()));
      return groupMatch || programMatch;
    });
  }, [courses, currentGroup, currentStudent]);

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
    return activities.filter((activity) => activity.studentId === currentStudent.id);
  }, [activities, currentStudent?.id]);

  const activitiesByModule = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    myActivities.forEach((activity) => {
      if (!map[activity.moduleId]) map[activity.moduleId] = [];
      map[activity.moduleId].push(activity);
    });
    return map;
  }, [myActivities]);

  const unlockedModules = useMemo(() => {
    const unlocked: Record<string, boolean> = {};
    Object.values(modulesByCourse).forEach((courseModules) => {
      courseModules.forEach((module, index) => {
        if (index === 0) {
          unlocked[module.id] = true;
        } else {
          const prev = courseModules[index - 1];
          const prevActivities = activitiesByModule[prev.id] ?? [];
          unlocked[module.id] = prevActivities.length > 0 && prevActivities.every((activity) => activity.status === 'Aprobada');
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
                                <div className="flex items-center justify-between gap-3 text-sm">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">{activity.title}</p>
                                    <p className="text-[11px] text-slate-500 truncate">{activity.lesson}</p>
                                  </div>
                                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{activity.status}</span>
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
  );
};