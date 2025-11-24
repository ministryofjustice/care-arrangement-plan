import { Session, SessionData } from 'express-session';
import { ValidationError } from 'express-validator';

export const loggerMocks = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
};

export const flashMockErrors: ValidationError[] = [];
export const flashFormValues: Record<string, string | string[] | number[]>[] = [];

export const flashMock = jest
  .fn()
  .mockImplementation((type: 'errors' | 'formValues') => (type === 'errors' ? flashMockErrors : flashFormValues));

export const sessionMock = {} as Session & Partial<SessionData>;

export const mockNow = new Date('2025-01-01T00:00:00Z');

export const mockCheckFlowConfig
