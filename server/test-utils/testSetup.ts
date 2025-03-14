// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom'
import { flashFormValues, flashMockErrors, loggerMocks, sessionMock } from './testMocks'
import { CAPSession } from '../@types/session'

jest.mock('../logger', () => loggerMocks)

beforeEach(() => {
  flashMockErrors.length = 0
  flashFormValues.length = 0
  Object.keys(sessionMock).forEach((key: keyof CAPSession) => delete sessionMock[key])
})

afterEach(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
})
