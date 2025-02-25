// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom'
import { flashFormValues, flashMockErrors, loggerMocks, sessionMock } from './testMocks'

jest.mock('../../logger', () => loggerMocks)

beforeEach(() => {
  Object.assign(flashMockErrors, [])
  Object.assign(flashFormValues, [])
  Object.assign(sessionMock, {})
})

afterEach(() => {
  jest.clearAllMocks()
})
