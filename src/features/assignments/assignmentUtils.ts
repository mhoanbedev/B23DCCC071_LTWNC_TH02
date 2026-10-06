import type { Assignment } from '../../types';

const dateOnly = (value: string | Date): Date => {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isOverdue = (assignment: Assignment, today = new Date()): boolean =>
  !assignment.completed && dateOnly(assignment.dueDate).getTime() < dateOnly(today).getTime();

export const calcDaysLeft = (dueDate: string, today = new Date()): number =>
  Math.ceil((dateOnly(dueDate).getTime() - dateOnly(today).getTime()) / 86400000);

export const calcStats = (items: Assignment[], today = new Date()) => items.reduce((result, item) => {
  result.total += 1;
  if (item.completed) result.completed += 1;
  if (isOverdue(item, today)) result.overdue += 1;
  result.bySubject[item.subject] = (result.bySubject[item.subject] ?? 0) + 1;
  return result;
}, { total: 0, completed: 0, overdue: 0, bySubject: {} as Record<string, number> });

export const sortPinnedFirst = (items: Assignment[], pinnedIds: string[]): Assignment[] => [...items].sort(
  (first, second) => Number(pinnedIds.includes(second.id)) - Number(pinnedIds.includes(first.id)),
);

export const createSampleAssignments = (count = 10000): Assignment[] => Array.from({ length: count }, (_, index) => ({
  id: `sample-${index + 1}`,
  title: `Bài tập mẫu ${index + 1}`,
  subject: (['Toán', 'Ngữ văn', 'Tiếng Anh', 'Khoa học', 'Lịch sử'] as const)[index % 5],
  dueDate: new Date(Date.now() + ((index % 14) - 5) * 86400000).toISOString().slice(0, 10),
  completed: index % 7 === 0,
}));
