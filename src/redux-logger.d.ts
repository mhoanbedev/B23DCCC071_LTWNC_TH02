declare module 'redux-logger' {
  import type { Middleware } from '@reduxjs/toolkit';
  interface LoggerOptions { predicate?: (_state: unknown, action: { type: string }) => boolean; }
  export const createLogger: (options?: LoggerOptions) => Middleware;
  const logger: Middleware;
  export default logger;
}
