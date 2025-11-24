import '@testing-library/jest-dom';
import path from 'path';

import i18n from 'i18n';

import { CAPSession } from '../@types/session';
import config from '../config';

import { flashFormValues, flashMockErrors, loggerMocks, mockCheckFormProgressFromConfig, mockNow, sessionMock } from './testMocks';

jest.mock('../logging/logger', () => loggerMocks);
jest.mock('../middleware/checkFormProgressFromConfig', () => mockCheckFormProgressFromConfig)

beforeAll(() => {
  i18n.configure({
    defaultLocale: 'en',
    locales: ['en'],
    directory: path.resolve(__dirname, '../locales'),
    updateFiles: false,
    objectNotation: true,
  });
});

beforeEach(() => {
  flashMockErrors.length = 0;
  flashFormValues.length = 0;
  Object.keys(sessionMock).forEach((key: keyof CAPSession) => delete sessionMock[key]);
  jest.useFakeTimers({ advanceTimers: true }).setSystemTime(mockNow);
  // Disable authentication by default for tests (can be overridden in individual tests)
  config.useAuth = false;
  (mockCheckFormProgressFromConfig as jest.Mock).mockClear();
});

afterEach(() => {
  jest.clearAllMocks();
});
