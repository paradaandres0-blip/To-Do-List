import type { Activity } from '../types/activity.types';
import type { Course } from '../types/course.types';
import type { Group } from '../types/group.types';
import type { Student } from '../types/student.types';

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? '';

export const isActivityVisibleToStudent = (
  activity: Activity,
  student: Student | null,
  course: Course | null,
  group: Group | null,
): boolean => {
  if (!student) return false;

  if (activity.studentId && activity.studentId === student.id) {
    return true;
  }

  if (activity.studentId && activity.studentId !== student.id) {
    return false;
  }

  const activityCourseTitle = normalize(activity.course);
  const studentCourseTitle = normalize(course?.title);
  const studentGroupName = normalize(student.group);
  const groupName = normalize(group?.name);
  const groupProgramNames = (group?.programs ?? []).map((assignment) => normalize(assignment.program));
  const studentProgram = normalize(student.program);

  const matchesCourseTitle = activityCourseTitle.length > 0 && studentCourseTitle.length > 0 && activityCourseTitle === studentCourseTitle;
  const matchesGroupName = studentGroupName.length > 0 && groupName.length > 0 && studentGroupName === groupName;
  const matchesProgram = studentProgram.length > 0 && groupProgramNames.includes(studentProgram);

  return Boolean(matchesCourseTitle || matchesGroupName || matchesProgram);
};
