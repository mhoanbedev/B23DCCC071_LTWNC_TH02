import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Assignment } from '../../types';
export interface AssignmentsState { items: Assignment[]; status: 'idle' | 'loading' | 'succeeded' | 'failed'; error: string | null; }
const initialState: AssignmentsState = { items: [], status: 'idle', error: null };
const slice = createSlice({ name: 'assignments', initialState, reducers: {
  loadStart: state => { state.status = 'loading'; state.error = null; },
  loadSuccess: (state, action: PayloadAction<Assignment[]>) => { state.items = action.payload; state.status = 'succeeded'; },
  loadFailure: (state, action: PayloadAction<string>) => { state.status = 'failed'; state.error = action.payload; },
  addAssignment: (state, action: PayloadAction<Assignment>) => { state.items.push(action.payload); },
  toggleCompleted: (state, action: PayloadAction<string>) => { const item = state.items.find(x => x.id === action.payload); if (item) item.completed = !item.completed; },
  removeAssignment: (state, action: PayloadAction<string>) => { state.items = state.items.filter(item => item.id !== action.payload); },
  setItems: (state, action: PayloadAction<Assignment[]>) => { state.items = action.payload; }
} });
export const { loadStart, loadSuccess, loadFailure, addAssignment, toggleCompleted, removeAssignment, setItems } = slice.actions;
export default slice.reducer;
