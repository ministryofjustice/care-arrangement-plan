import '@testing-library/jest-dom';
import path from 'path';

import i18n from 'i18n';

import { CAPSession } from '../@types/session';

import { flashFormValues, flashMockErrors, loggerMocks, mockNow, sessionMock } from './testMocks';

jest.mock('../logger', () => loggerMocks);

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
});

afterEach(() => {
  jest.clearAllMocks();
});
