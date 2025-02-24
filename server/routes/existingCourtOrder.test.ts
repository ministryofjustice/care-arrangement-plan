import request from 'supertest'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'

const app = testAppSetup()

describe(`GET ${paths.EXISTING_COURT_ORDER}`, () => {
  it('should render existing court order page', () => {
    return request(app)
      .get(paths.EXISTING_COURT_ORDER)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('You can still use this service')
      })
  })
})
