import request from 'supertest'
import { JSDOM } from 'jsdom'
import { SessionData } from 'express-session'
import testAppSetup from '../../test-utils/testAppSetup'
import paths from '../../constants/paths'
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks'
import formFields from '../../constants/formFields'
import { whereMostlyLive } from '../../@types/fields'

const app = testAppSetup()

const session: Partial<SessionData> = {
  namesOfChildren: ['James', 'Rachel', 'Jack'],
  numberOfChildren: 3,
  initialAdultName: 'Sarah',
  secondaryAdultName: 'Steph',
  livingAndVisiting: {},
}

describe(paths.LIVING_VISITING_MOSTLY_LIVE, () => {
  describe('GET', () => {
    it('should render the mostly live page for a single child', async () => {
      Object.assign(sessionMock, session)

      sessionMock.numberOfChildren = 1
      sessionMock.namesOfChildren = ['James']

      const response = await request(app).get(paths.LIVING_VISITING_MOSTLY_LIVE).expect('Content-Type', /html/)

      const dom = new JSDOM(response.text)

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Where will James mostly live?')
      expect(dom.window.document.querySelector('h2')).toBeNull()
      expect(dom.window.document.querySelector(':checked')).toBeNull()
      expect(dom.window.document.querySelector('fieldset')).not.toHaveAttribute('aria-describedby')
      expect(dom.window.document.querySelector(`label[for="${formFields.MOSTLY_LIVE_WHERE}"]`)).toHaveTextContent(
        `With ${session.initialAdultName}`,
      )
      expect(dom.window.document.querySelector(`label[for="${formFields.MOSTLY_LIVE_WHERE}-2"]`)).toHaveTextContent(
        `With ${session.secondaryAdultName}`,
      )
      expect(dom.window.document.querySelector(`label[for="${formFields.MOSTLY_LIVE_WHERE}-3"]`)).toHaveTextContent(
        `James will split time between ${session.initialAdultName} and ${session.secondaryAdultName}`,
      )
      expect(dom.window.document.querySelector(`#${formFields.DESCRIBE_ARRANGEMENT}`)).not.toHaveAttribute(
        'aria-describedby',
      )
    })

    it('should render the mostly live page for multiple children', async () => {
      Object.assign(sessionMock, session)

      const response = await request(app).get(paths.LIVING_VISITING_MOSTLY_LIVE).expect('Content-Type', /html/)

      const dom = new JSDOM(response.text)

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Where will the children mostly live?')
      expect(dom.window.document.querySelector(`label[for="${formFields.MOSTLY_LIVE_WHERE}-3"]`)).toHaveTextContent(
        `They will split time between ${session.initialAdultName} and ${session.secondaryAdultName}`,
      )
    })

    it('should render error flash responses correctly', async () => {
      const primaryError = 'errorOne'
      const secondaryError = 'errorTwo'
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: formFields.MOSTLY_LIVE_WHERE,
          type: 'field',
        },
        {
          location: 'body',
          msg: secondaryError,
          path: formFields.DESCRIBE_ARRANGEMENT,
          type: 'field',
        },
      ])

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_MOSTLY_LIVE)).text)

      expect(dom.window.document.querySelector('h2')).toHaveTextContent('There is a problem')
      expect(dom.window.document.querySelector(`#${formFields.MOSTLY_LIVE_WHERE}-error`)).toHaveTextContent(
        primaryError,
      )
      expect(dom.window.document.querySelector(`#${formFields.DESCRIBE_ARRANGEMENT}`)).toHaveAttribute(
        'aria-describedby',
        `${formFields.DESCRIBE_ARRANGEMENT}-error`,
      )
      expect(dom.window.document.querySelector(`#${formFields.DESCRIBE_ARRANGEMENT}-error`)).toHaveTextContent(
        secondaryError,
      )
    })

    it('should render field value flash responses correctly', async () => {
      const arrangement = 'arrangement'
      Object.assign(flashFormValues, [
        { [formFields.DESCRIBE_ARRANGEMENT]: arrangement, [formFields.MOSTLY_LIVE_WHERE]: 'other' },
      ])

      sessionMock.livingAndVisiting.mostlyLive = {
        where: 'withInitial',
        describeArrangement: 'wrong arrangement',
      }

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_MOSTLY_LIVE)).text)

      expect(dom.window.document.querySelector(`#${formFields.MOSTLY_LIVE_WHERE}-5`)).toHaveAttribute('checked')
      expect(dom.window.document.querySelector(`#${formFields.DESCRIBE_ARRANGEMENT}`)).toHaveValue(arrangement)
    })

    it('should render field previous values correctly', async () => {
      const arrangement = 'arrangement'

      sessionMock.livingAndVisiting.mostlyLive = {
        where: 'other',
        describeArrangement: arrangement,
      }

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_MOSTLY_LIVE)).text)

      expect(dom.window.document.querySelector(`#${formFields.MOSTLY_LIVE_WHERE}-5`)).toHaveAttribute('checked')
      expect(dom.window.document.querySelector(`#${formFields.DESCRIBE_ARRANGEMENT}`)).toHaveValue(arrangement)
    })
  })

  describe('POST', () => {
    it('should reload page and set flash when the radio button is not filled', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_MOSTLY_LIVE)
        .expect(302)
        .expect('location', paths.LIVING_VISITING_MOSTLY_LIVE)

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.MOSTLY_LIVE_WHERE,
          type: 'field',
        },
      ])
    })

    it('should reload page and set flash when the radio button is other, but arrangements are not described', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_MOSTLY_LIVE)
        .send({ [formFields.MOSTLY_LIVE_WHERE]: 'other' })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_MOSTLY_LIVE)

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.DESCRIBE_ARRANGEMENT,
          type: 'field',
          value: '',
        },
      ])
    })

    it('should redirect to task list page if the page is correctly filled and other is selected', async () => {
      const where = 'other'
      const describeArrangement = 'arrangement'
      await request(app)
        .post(paths.LIVING_VISITING_MOSTLY_LIVE)
        .send({ [formFields.MOSTLY_LIVE_WHERE]: where, [formFields.DESCRIBE_ARRANGEMENT]: describeArrangement })
        .expect(302)
        .expect('location', paths.TASK_LIST)

      expect(sessionMock.livingAndVisiting).toEqual({ mostlyLive: { where, describeArrangement } })
    })

    it('should redirect to task list page if the page is correctly filled and other is not selected', async () => {
      sessionMock.livingAndVisiting = { mostlyLive: { where: 'withSecondary' }, overnightVisits: { willHappen: true } }

      const where = 'withInitial'
      await request(app)
        .post(paths.LIVING_VISITING_MOSTLY_LIVE)
        .send({ [formFields.MOSTLY_LIVE_WHERE]: where })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)

      expect(sessionMock.livingAndVisiting).toEqual({ mostlyLive: { where } })
    })

    it('should not reset the livingAndVisiting data if the same option is set', async () => {
      const where: whereMostlyLive = 'withInitial'
      const initialLivingAndVisiting = { mostlyLive: { where }, overnightVisits: { willHappen: true } }

      sessionMock.livingAndVisiting = initialLivingAndVisiting

      await request(app)
        .post(paths.LIVING_VISITING_MOSTLY_LIVE)
        .send({ [formFields.MOSTLY_LIVE_WHERE]: where })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)

      expect(sessionMock.livingAndVisiting).toEqual(initialLivingAndVisiting)
    })
  })
})
