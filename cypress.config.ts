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
  e2e: {
    baseUrl: 'http://localhost:8001',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration-tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
  },
});
