import { isOverdue, calcDaysLeft, calcStats, createSampleAssignments, sortPinnedFirst } from './assignmentUtils';
import type { Assignment } from '../../types';

const base: Assignment = { id: '1', title: 'Bài A', subject: 'Toán', dueDate: '2026-01-01', completed: false };

test('isOverdue detects unfinished past assignments', () => expect(isOverdue(base, new Date('2026-01-02'))).toBe(true));
test('completed assignment is never overdue', () => expect(isOverdue({ ...base, completed: true }, new Date('2026-01-02'))).toBe(false));
test('assignment due today is not overdue', () => expect(isOverdue(base, new Date('2026-01-01'))).toBe(false));
test('calcDaysLeft returns zero on due date', () => expect(calcDaysLeft('2026-01-02', new Date('2026-01-02'))).toBe(0));
test('calcDaysLeft returns negative days for past due dates', () => expect(calcDaysLeft('2026-01-01', new Date('2026-01-03'))).toBe(-2));
test('calcStats counts completion, overdue and each subject', () => expect(calcStats([base, { ...base, id: '2', subject: 'Khoa học', completed: true }], new Date('2026-01-02'))).toEqual({ total: 2, completed: 1, overdue: 1, bySubject: { Toán: 1, 'Khoa học': 1 } }));
test('calcStats handles an empty list', () => expect(calcStats([], new Date('2026-01-02'))).toEqual({ total: 0, completed: 0, overdue: 0, bySubject: {} }));
test('sample generator creates requested volume', () => expect(createSampleAssignments(20)).toHaveLength(20));
test('default sample generator creates 10,000 assignments', () => expect(createSampleAssignments()).toHaveLength(10000));
test('pinned assignments are sorted before unpinned items', () => expect(sortPinnedFirst([{ ...base, id: 'a' }, { ...base, id: 'b' }], ['b']).map(item => item.id)).toEqual(['b', 'a']));
