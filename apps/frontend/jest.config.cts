const nextJest = require('next/jest.js');

const createJestConfig = nextJest({
  dir: __dirname,
});

const config = {
  displayName: 'frontend',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/i18n/(.*)$': '<rootDir>/src/i18n/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/frontend',
  setupFilesAfterEnv: ['<rootDir>/specs/setup-tests.ts'],
  testEnvironment: 'jsdom',
};

module.exports = createJestConfig(config);
