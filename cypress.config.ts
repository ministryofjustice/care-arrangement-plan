import { defineConfig } from 'cypress';

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration-tests/fixtures',
  screenshotsFolder: 'integration-tests/screenshots',
  videosFolder: 'integration-tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  env: {
    BETA_ACCESS_PASSWORD: process.env.CYPRESS_BETA_ACCESS_PASSWORD || 'parent-planner',
  },
  e2e: {
    baseUrl: 'http://localhost:8001',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration-tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration-tests/support/e2e.ts',
  },
});
