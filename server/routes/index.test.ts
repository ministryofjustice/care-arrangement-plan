import request from 'supertest'
import testAppSetup from '../test-utils/testAppSetup'

describe('GET /', () => {
  it('should render index page', () => {
    return request(testAppSetup())
      .get('/')
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('This site is under construction...')
      })
  })
})
