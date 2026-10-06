import { configureStore } from '@reduxjs/toolkit';
import reducer from './features/assignments/assignmentsSlice';
import { createLogger } from 'redux-logger';
const isDevelopment = process.env.NODE_ENV === 'development';
const developmentLogger = createLogger({ predicate: (_state, action) => action.type !== 'assignments/setItems' });
export const store = configureStore({ reducer: { assignments: reducer }, middleware: getDefault => isDevelopment ? getDefault().concat(developmentLogger) : getDefault() });
export type RootState = ReturnType<typeof store.getState>; export type AppDispatch = typeof store.dispatch;
