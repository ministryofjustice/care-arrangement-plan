import request from 'supertest'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'
import { sessionMock } from '../test-utils/testMocks'

const app = testAppSetup()

describe(`GET ${paths.TASK_LIST}`, () => {
  it('should render task list page', () => {
    sessionMock.namesOfChildren = ['James', 'Rachel', 'Jack']

    return request(app)
      .get(paths.TASK_LIST)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Child arrangements plan for James, Rachel and Jack')
      })
  })
})
