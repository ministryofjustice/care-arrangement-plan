import request from 'supertest'
import { JSDOM } from 'jsdom'
import { SessionData } from 'express-session'
import testAppSetup from '../../test-utils/testAppSetup'
import paths from '../../constants/paths'
import { flashMock, flashMockErrors, sessionMock } from '../../test-utils/testMocks'
import formFields from '../../constants/formFields'

const app = testAppSetup()

const session: Partial<SessionData> = {
  namesOfChildren: ['James', 'Rachel', 'Jack'],
  numberOfChildren: 3,
  initialAdultName: 'Sarah',
  secondaryAdultName: 'Steph',
  livingAndVisiting: {
    mostlyLive: {
      where: 'withInitial',
    },
  },
}

describe(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN, () => {
  describe('GET', () => {
    beforeEach(() => {
      Object.assign(sessionMock, session)
    })

    it('should render the will overnights happen page for a single child', async () => {
      sessionMock.numberOfChildren = 1
      sessionMock.namesOfChildren = ['James']

      const response = await request(app)
        .get(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)
        .expect('Content-Type', /html/)

      const dom = new JSDOM(response.text)

      expect(dom.window.document.querySelector('h1')).toHaveTextContent(
        `Will James stay overnight with ${session.secondaryAdultName}?`,
      )
      expect(dom.window.document.querySelector('h2')).toBeNull()
      expect(dom.window.document.querySelector(':checked')).toBeNull()
      expect(dom.window.document.querySelector('fieldset')).not.toHaveAttribute('aria-describedby')
    })

    it('should render the will overnights happen page for multiple children', () => {
      sessionMock.livingAndVisiting.mostlyLive.where = 'withSecondary'

      return request(app)
        .get(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain(`Will the children stay overnight with ${session.initialAdultName}?`)
        })
    })

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.WILL_OVERNIGHTS_HAPPEN,
          type: 'field',
        },
      ])

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)).text)

      expect(dom.window.document.querySelector('h2')).toHaveTextContent('There is a problem')
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        `${formFields.WILL_OVERNIGHTS_HAPPEN}-error`,
      )
    })

    it('should render field value of yes correctly', async () => {
      sessionMock.livingAndVisiting.overnightVisits = { willHappen: true }

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)).text)

      expect(dom.window.document.querySelector(`#${formFields.WILL_OVERNIGHTS_HAPPEN}`)).toHaveAttribute('checked')
    })

    it('should render field value of no correctly', async () => {
      sessionMock.livingAndVisiting.overnightVisits = { willHappen: false }

      const dom = new JSDOM((await request(app).get(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)).text)

      expect(dom.window.document.querySelector(`#${formFields.WILL_OVERNIGHTS_HAPPEN}-2`)).toHaveAttribute('checked')
    })
  })

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.WILL_OVERNIGHTS_HAPPEN,
          type: 'field',
        },
      ])
    })

    it('should redirect to will daytime visits happen if the answer is no', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)
        .send({ [formFields.WILL_OVERNIGHTS_HAPPEN]: 'No' })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN)

      expect(sessionMock.livingAndVisiting.overnightVisits).toEqual({ willHappen: false })
    })

    it('should redirect to which days overnight if the answer is yes', async () => {
      await request(app)
        .post(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)
        .send({ [formFields.WILL_OVERNIGHTS_HAPPEN]: 'Yes' })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)

      expect(sessionMock.livingAndVisiting.overnightVisits).toEqual({ willHappen: true })
    })

    it('should not override existing session if the answer is the same the existing answer', async () => {
      const overnightVisits = { willHappen: true, whichDays: { noDecisionRequired: true } }

      sessionMock.livingAndVisiting.overnightVisits = overnightVisits

      await request(app)
        .post(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)
        .send({ [formFields.WILL_OVERNIGHTS_HAPPEN]: 'Yes' })
        .expect(302)
        .expect('location', paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)

      expect(sessionMock.livingAndVisiting.overnightVisits).toEqual(overnightVisits)
    })
  })
})
