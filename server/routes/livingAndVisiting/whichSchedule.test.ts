import request from 'supertest'
import { JSDOM } from 'jsdom'
import testAppSetup from '../../test-utils/testAppSetup'
import paths from '../../constants/paths'
import { flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks'
import formFields from '../../constants/formFields'

const app = testAppSetup()

beforeEach(() => {
  sessionMock.livingAndVisiting = {
    mostlyLive: {
      where: 'split',
    },
  }
})

describe(paths.LIVING_VISITING_WHICH_SCHEDULE, () => {
  describe('GET', () => {
    it('should render which schedule page', async () => {
      const response = await request(app).get(paths.LIVING_VISITING_WHICH_SCHEDULE).expect('Content-Type', /html/)

      const dom = new JSDOM(response.text)

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        "Which schedule best meets the children's needs?",
      )
      expect(dom.window.document.querySelector('h2')).toBeNull()
      expect(dom.window.document.querySelector(`#${formFields.WHICH_SCHEDULE}`)).not.toHaveAttribute('aria-describedby')
    })

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.WHICH_SCHEDULE,
          type: 'field',
        },
      ])

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WHICH_SCHEDULE)).text)

      expect(dom.window.document.querySelector('h2')).toHaveTextContent('There is a problem')
      expect(dom.window.document.querySelector(`#${formFields.WHICH_SCHEDULE}`)).toHaveAttribute(
        'aria-describedby',
        `${formFields.WHICH_SCHEDULE}-error`,
      )
    })

    it('should render existing values correctly', async () => {
      const response = 'Alternating weeks'

      sessionMock.livingAndVisiting = {
        whichSchedule: {
          noDecisionRequired: false,
          answer: response,
        },
      }

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WHICH_SCHEDULE)).text)

      expect(dom.window.document.querySelector(`#${formFields.WHICH_SCHEDULE}`)).toHaveValue(response)
    })
  })

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_WHICH_SCHEDULE)
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WHICH_SCHEDULE)

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.WHICH_SCHEDULE,
          type: 'field',
          value: '',
        },
      ])
    })

    it('should redirect to task list when the answer is entered and set whatWillHappen', async () => {
      const response = 'Alternating weeks'

      await request(app)
        .post(paths.LIVING_VISITING_WHICH_SCHEDULE)
        .send({ [formFields.WHICH_SCHEDULE]: response })
        .expect(302)
        .expect('location', paths.TASK_LIST)

      expect(sessionMock.livingAndVisiting).toEqual({
        mostlyLive: {
          where: 'split',
        },
        whichSchedule: {
          noDecisionRequired: false,
          answer: response,
        },
      })
    })
  })
})

describe(`POST ${paths.LIVING_VISITING_WHICH_SCHEDULE_SKIP}`, () => {
  it('should redirect to task list when the answer is entered and set whatWillHappen', async () => {
    await request(app).post(paths.LIVING_VISITING_WHICH_SCHEDULE_SKIP).expect(302).expect('location', paths.TASK_LIST)

    expect(sessionMock.livingAndVisiting).toEqual({
      mostlyLive: {
        where: 'split',
      },
      whichSchedule: {
        noDecisionRequired: true,
      },
    })
  })
})
