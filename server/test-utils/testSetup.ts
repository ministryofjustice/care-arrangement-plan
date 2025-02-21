// eslint-disable-next-line import/prefer-default-export
export const loggerMocks = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
}

jest.mock('../../logger', () => loggerMocks)

afterEach(() => {
  jest.resetAllMocks()
})
