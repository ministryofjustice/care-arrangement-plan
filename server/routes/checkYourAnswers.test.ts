import request from 'supertest'
import { SessionData } from 'express-session'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'
import { sessionMock } from '../test-utils/testMocks'

const app = testAppSetup()

const session: Partial<SessionData> = {
  namesOfChildren: ['James', 'Rachel', 'Jack'],
  initialAdultName: 'Bob',
  secondaryAdultName: 'Sam',
  specialDays: {
    whatWillHappen: {
      noDecisionRequired: true,
    },
  },
}

describe(`GET ${paths.CHECK_YOUR_ANSWERS}`, () => {
  it('should render check your answers page', () => {
    Object.assign(sessionMock, session)

    return request(app)
      .get(paths.CHECK_YOUR_ANSWERS)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Check your answers')
        expect(response.text).toContain('Bob and Sam')
        expect(response.text).toContain('James, Rachel and Jack')
      })
  })
})
