import reducer, { addAssignment, loadFailure, loadStart, loadSuccess, removeAssignment, toggleCompleted } from './assignmentsSlice';
const item = { id: 'a', title: 'Bài', subject: 'Toán' as const, dueDate: '2026-12-01', completed: false };
test('loadStart enters loading state', () => expect(reducer(undefined, loadStart()).status).toBe('loading'));
test('loadSuccess stores items', () => expect(reducer(undefined, loadSuccess([item])).items).toEqual([item]));
test('loadFailure stores error', () => expect(reducer(undefined, loadFailure('failed')).error).toBe('failed'));
test('add and toggle assignment', () => { let state = reducer(undefined, addAssignment(item)); state = reducer(state, toggleCompleted('a')); expect(state.items[0].completed).toBe(true); });
test('remove assignment deletes only the matching item', () => { const state = reducer({ items: [item], status: 'idle', error: null }, removeAssignment('a')); expect(state.items).toHaveLength(0); });
