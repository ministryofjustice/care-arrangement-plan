import request from 'supertest'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'

const app = testAppSetup()

describe(`GET ${paths.START}`, () => {
  it('should render index page', () => {
    return request(app)
      .get(paths.START)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Propose a child arrangements plan')
      })
  })
})
