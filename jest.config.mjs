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
  testMatch: ['<rootDir>/server/**/*.test.{ts,js,jsx,mjs}'],
  testEnvironment: 'node',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/jest/',
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
}

export default config
