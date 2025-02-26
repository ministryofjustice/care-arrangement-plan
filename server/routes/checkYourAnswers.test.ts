import request from 'supertest'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'
import { sessionMock } from '../test-utils/testMocks'

const app = testAppSetup()

describe(`GET ${paths.CHECK_YOUR_ANSWERS}`, () => {
  it('should render check your answers page', () => {
    sessionMock.initialAdultName = 'Bob'
    sessionMock.secondaryAdultName = 'Sam'
    sessionMock.namesOfChildren = ['James', 'Rachel', 'Jack']

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
