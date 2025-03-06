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

describe(`GET ${paths.SHARE_PLAN}`, () => {
  beforeEach(() => {
    Object.assign(sessionMock, structuredClone(session))
  })

  it('should render existing court order page', () => {
    return request(app)
      .get(paths.SHARE_PLAN)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Child arrangements plan for James, Rachel and Jack')
      })
  })

  it('should render no court order text when there is no court order', () => {
    sessionMock.courtOrderInPlace = false

    return request(app)
      .get(paths.SHARE_PLAN)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).not.toContain('As you have a court order in place')
        expect(response.text).toContain('there is no court order in place at this time')
      })
  })

  it('should render court order text when there is no court order', () => {
    sessionMock.courtOrderInPlace = true

    return request(app)
      .get(paths.SHARE_PLAN)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('As you have a court order in place')
        expect(response.text).toContain('there is a court order in place at this time')
      })
  })
})
