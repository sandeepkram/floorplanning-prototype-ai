export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.spec.ts', '**/tests/**/*.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {}],
  },
};
