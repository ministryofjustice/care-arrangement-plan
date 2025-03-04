import request from 'supertest'
import { JSDOM } from 'jsdom'
import { SessionData } from 'express-session'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'
import { sessionMock } from '../test-utils/testMocks'

const app = testAppSetup()

const session: Partial<SessionData> = {
  namesOfChildren: ['James', 'Rachel', 'Jack'],
  specialDays: {
    whatWillHappen: {
      noDecisionRequired: true,
    },
  },
}

describe(`GET ${paths.TASK_LIST}`, () => {
  it('should render task list page', async () => {
    Object.assign(sessionMock, session)

    const response = await request(app).get(paths.TASK_LIST).expect('Content-Type', /html/)

    expect(response.text).not.toContain('Incomplete')

    const dom = new JSDOM(response.text)

    expect(dom.window.document.querySelector('h1')).toHaveTextContent(
      'Child arrangements plan for James, Rachel and Jack',
    )
    expect(dom.window.document.querySelector('[role="button"]')).not.toBeNull()
  })

  it('should not render the continue button if the what will happen section is not filled out', async () => {
    Object.assign(sessionMock, session)
    sessionMock.specialDays = null

    const response = await request(app).get(paths.TASK_LIST).expect('Content-Type', /html/)

    const dom = new JSDOM(response.text)

    expect(dom.window.document.querySelector('[role="button"]')).toBeNull()
  })
})
