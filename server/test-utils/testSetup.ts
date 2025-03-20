import '@testing-library/jest-dom';
import { CAPSession } from '../@types/session';

import { flashFormValues, flashMockErrors, loggerMocks, mockNow, sessionMock } from './testMocks';

jest.mock('../logger', () => loggerMocks);

beforeEach(() => {
  flashMockErrors.length = 0;
  flashFormValues.length = 0;
  Object.keys(sessionMock).forEach((key: keyof CAPSession) => delete sessionMock[key]);
  jest.useFakeTimers({ advanceTimers: true }).setSystemTime(mockNow);
});

afterEach(() => {
  jest.clearAllMocks();
});
