// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom'
import { flashFormValues, flashMockErrors, loggerMocks, sessionMock } from './testMocks'

jest.mock('../logger', () => loggerMocks)

beforeEach(() => {
  flashMockErrors.length = 0
  flashFormValues.length = 0
  Object.assign(sessionMock, {})
})

afterEach(() => {
  jest.clearAllMocks()
})
