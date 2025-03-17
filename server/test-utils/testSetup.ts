import '@testing-library/jest-dom';
import { CAPSession } from '../@types/session';

import { flashFormValues, flashMockErrors, loggerMocks, sessionMock } from './testMocks';

jest.mock('../logger', () => loggerMocks);

beforeEach(() => {
  flashMockErrors.length = 0;
  flashFormValues.length = 0;
  Object.keys(sessionMock).forEach((key: keyof CAPSession) => delete sessionMock[key]);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});
