const config = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  collectCoverageFrom: ['server/**/*.{ts,js,jsx,mjs}'],
  coverageReporters: ['cobertura', 'text'],
  testMatch: ['<rootDir>/server/**/*.test.{ts,js,jsx,mjs}'],
  testEnvironment: 'node',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputName: 'unit-tests.xml',
        suiteName: 'Unit Tests',
        outputDirectory: 'test-results/',
      },
    ],
    [
      './node_modules/jest-html-reporter',
      {
        outputPath: 'test-results/unit-test-reports.html',
      },
    ],
  ],
  moduleFileExtensions: ['web.js', 'js', 'json', 'node', 'ts'],
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['./server/test-utils/testSetup.ts'],
};

export default config;
