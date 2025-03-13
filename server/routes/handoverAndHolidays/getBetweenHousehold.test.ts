import request from 'supertest'
import { JSDOM } from 'jsdom'
import { SessionData } from 'express-session'
import testAppSetup from '../../test-utils/testAppSetup'
import paths from '../../constants/paths'
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks'
import formFields from '../../constants/formFields'

const app = testAppSetup()

const session: Partial<SessionData> = {
  initialAdultName: 'Sarah',
  secondaryAdultName: 'Steph',
}

beforeEach(() => {
  Object.assign(sessionMock, structuredClone(session))
})

describe(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS, () => {
  describe('GET', () => {
    it('should render the get between households page', async () => {
      const response = await request(app)
        .get(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)
        .expect('Content-Type', /html/)

      const dom = new JSDOM(response.text)

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('How will the children get between households?')
      expect(dom.window.document.querySelector('h2')).toBeNull()
      expect(dom.window.document.querySelector(':checked')).toBeNull()
      expect(dom.window.document.querySelector('fieldset')).not.toHaveAttribute('aria-describedby')
      expect(dom.window.document.querySelector(`label[for="${formFields.GET_BETWEEN_HOUSEHOLDS}"]`)).toHaveTextContent(
        `${session.initialAdultName} collects the children`,
      )
      expect(
        dom.window.document.querySelector(`label[for="${formFields.GET_BETWEEN_HOUSEHOLDS}-2"]`),
      ).toHaveTextContent(`${session.secondaryAdultName} collects the children`)
      expect(
        dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}`),
      ).not.toHaveAttribute('aria-describedby')
    })

    it('should render error flash responses correctly', async () => {
      const primaryError = 'errorOne'
      const secondaryError = 'errorTwo'
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: formFields.GET_BETWEEN_HOUSEHOLDS,
          type: 'field',
        },
        {
          location: 'body',
          msg: secondaryError,
          path: formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT,
          type: 'field',
        },
      ])

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)).text)

      expect(dom.window.document.querySelector('h2')).toHaveTextContent('There is a problem')
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        `${formFields.GET_BETWEEN_HOUSEHOLDS}-error`,
      )
      expect(dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS}-error`)).toHaveTextContent(
        primaryError,
      )
      expect(
        dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}`),
      ).toHaveAttribute('aria-describedby', `${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-error`)
      expect(
        dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}-error`),
      ).toHaveTextContent(secondaryError)
    })

    it('should render field value flash responses correctly', async () => {
      const arrangement = 'arrangement'
      Object.assign(flashFormValues, [
        {
          [formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT]: arrangement,
          [formFields.GET_BETWEEN_HOUSEHOLDS]: 'other',
        },
      ])

      sessionMock.handoverAndHolidays = {
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: 'secondaryCollects',
          describeArrangement: 'wrong arrangement',
        },
      }

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)).text)

      expect(dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS}-3`)).toHaveAttribute('checked')
      expect(
        dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue(arrangement)
    })

    it('should render field previous values correctly', async () => {
      const arrangement = 'arrangement'

      sessionMock.handoverAndHolidays = {
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: 'other',
          describeArrangement: arrangement,
        },
      }

      const dom = new JSDOM((await request(app).get(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)).text)

      expect(dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS}-3`)).toHaveAttribute('checked')
      expect(
        dom.window.document.querySelector(`#${formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT}`),
      ).toHaveValue(arrangement)
    })
  })

  describe('POST', () => {
    it('should reload page and set flash when the radio button is not filled', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.GET_BETWEEN_HOUSEHOLDS,
          type: 'field',
        },
      ])
    })

    it('should reload page and set flash when the radio button is other, but arrangements are not described', async () => {
      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)
        .send({ [formFields.GET_BETWEEN_HOUSEHOLDS]: 'other' })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT,
          type: 'field',
          value: '',
        },
      ])
    })

    it('should redirect to where handover page if the page is correctly filled', async () => {
      const how = 'other'
      const describeArrangement = 'arrangement'
      const initialHandoverAndHolidays = { whereHandover: { noDecisionRequired: true } }

      sessionMock.handoverAndHolidays = initialHandoverAndHolidays

      await request(app)
        .post(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)
        .send({
          [formFields.GET_BETWEEN_HOUSEHOLDS]: how,
          [formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT]: describeArrangement,
        })
        .expect(302)
        .expect('location', paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER)

      expect(sessionMock.handoverAndHolidays).toEqual({
        ...initialHandoverAndHolidays,
        getBetweenHouseholds: { noDecisionRequired: false, how, describeArrangement },
      })
    })
  })
})

describe(`POST ${paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS_NOT_REQUIRED}`, () => {
  it('should redirect to where handover page when the answer is entered and set getBetweenHouseholds', async () => {
    const initialHandoverAndHolidays = { whereHandover: { noDecisionRequired: true } }

    sessionMock.handoverAndHolidays = initialHandoverAndHolidays

    await request(app)
      .post(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS_NOT_REQUIRED)
      .expect(302)
      .expect('location', paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER)

    expect(sessionMock.handoverAndHolidays).toEqual({
      ...initialHandoverAndHolidays,
      getBetweenHouseholds: { noDecisionRequired: true },
    })
  })
})
