const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@lumaai/luma-web-sdk$': '<rootDir>/__tests__/__mocks__/luma-web-sdk.ts',
    '^@fal-ai/serverless-client$': '<rootDir>/__tests__/__mocks__/fal-ai-client.ts'
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { configFile: './__tests__/babel.config.js' }]
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/setup.ts',
    '<rootDir>/__tests__/babel.config.js',
    '<rootDir>/__tests__/__mocks__'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@lumaai|@fal-ai)/)'
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx']
};

module.exports = createJestConfig(customJestConfig); 