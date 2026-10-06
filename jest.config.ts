import type { Config } from 'jest';
const config: Config = {
  preset: 'ts-jest', testEnvironment: 'jsdom', setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  roots: ['<rootDir>/src'], testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js'], collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx'],
  coverageThreshold: { global: { statements: 0, branches: 0, functions: 0, lines: 0 }, './src/features/': { statements: 70, branches: 60, functions: 70, lines: 70 } },
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }] },
  moduleNameMapper: { '\\.(css)$': '<rootDir>/src/test/styleMock.ts' }
};
export default config;
