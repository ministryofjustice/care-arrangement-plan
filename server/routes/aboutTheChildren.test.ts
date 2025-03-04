import request from 'supertest'
import { JSDOM } from 'jsdom'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'
import formFields from '../constants/formFields'
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../test-utils/testMocks'

const app = testAppSetup()

describe(paths.ABOUT_THE_CHILDREN, () => {
  describe('GET', () => {
    it('should should redirect to the number of children page when the number of children is not set', async () => {
      return request(app).get(paths.ABOUT_THE_CHILDREN).expect(302).expect('location', paths.NUMBER_OF_CHILDREN)
    })

    it('should render about the children page with correct title and field when number of children is 1', async () => {
      sessionMock.numberOfChildren = 1

      const response = await request(app).get(paths.ABOUT_THE_CHILDREN).expect('Content-Type', /html/)

      const dom = new JSDOM(response.text)

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('About the child')
      expect(dom.window.document.querySelector('h2')).toBeNull()
      expect(dom.window.document.querySelector(`label[for="${formFields.CHILD_NAME}0"]`)).toHaveTextContent(
        'First name of the child',
      )
      expect(dom.window.document.querySelector(`#${formFields.CHILD_NAME}0`)).not.toHaveAttribute('aria-describedby')
      expect(dom.window.document.querySelector(`#${formFields.CHILD_NAME}1`)).toBeNull()
    })

    it('should render about the children page with correct title and field when number of children is more than 1', async () => {
      sessionMock.numberOfChildren = 2

      const response = await request(app).get(paths.ABOUT_THE_CHILDREN).expect('Content-Type', /html/)

      const dom = new JSDOM(response.text)

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('About the children')
      expect(dom.window.document.querySelector(`label[for="${formFields.CHILD_NAME}0"]`)).toHaveTextContent(
        'First name of the first child',
      )
      expect(dom.window.document.querySelector(`label[for="${formFields.CHILD_NAME}1"]`)).toHaveTextContent(
        'First name of the second child',
      )
    })

    it('should render error flash responses correctly', async () => {
      sessionMock.numberOfChildren = 1

      const primaryError = 'errorOne'
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: primaryError,
          path: `${formFields.CHILD_NAME}0`,
          type: 'field',
        },
      ])

      const dom = new JSDOM((await request(app).get(paths.ABOUT_THE_CHILDREN)).text)

      expect(dom.window.document.querySelector('h2')).toHaveTextContent('There is a problem')
      expect(dom.window.document.querySelector(`#${formFields.CHILD_NAME}0`)).toHaveAttribute(
        'aria-describedby',
        `${formFields.CHILD_NAME}0-error`,
      )
      expect(dom.window.document.querySelector(`#${formFields.CHILD_NAME}0-error`)).toHaveTextContent(primaryError)
    })

    it('should render field value flash responses correctly', async () => {
      sessionMock.numberOfChildren = 1
      sessionMock.namesOfChildren = ['James']

      const initialName = 'initialName'
      Object.assign(flashFormValues, [{ [`${formFields.CHILD_NAME}0`]: initialName }])

      const dom = new JSDOM((await request(app).get(paths.ABOUT_THE_CHILDREN)).text)

      expect(dom.window.document.querySelector(`#${formFields.CHILD_NAME}0`)).toHaveValue(initialName)
    })

    it('should render previous values correctly', async () => {
      const firstName = 'James'
      const secondName = 'Rachel'

      sessionMock.numberOfChildren = 2
      sessionMock.namesOfChildren = [firstName, secondName]

      const dom = new JSDOM((await request(app).get(paths.ABOUT_THE_CHILDREN)).text)

      expect(dom.window.document.querySelector(`#${formFields.CHILD_NAME}0`)).toHaveValue(firstName)
      expect(dom.window.document.querySelector(`#${formFields.CHILD_NAME}1`)).toHaveValue(secondName)
    })
  })

  describe('POST', () => {
    it('should reload page and set flash when the page is not correctly filled', async () => {
      sessionMock.numberOfChildren = 2
      const initialName = 'initialName'

      await request(app)
        .post(paths.ABOUT_THE_CHILDREN)
        .send({ [`${formFields.CHILD_NAME}0`]: initialName })
        .expect(302)
        .expect('location', paths.ABOUT_THE_CHILDREN)

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: `${formFields.CHILD_NAME}1`,
          type: 'field',
        },
      ])
      expect(flashMock).toHaveBeenCalledWith('formValues', {
        [`${formFields.CHILD_NAME}0`]: initialName,
      })
    })

    it('should redirect to task list page if the page is correctly filled', async () => {
      sessionMock.numberOfChildren = 2
      const initialName = 'initialName'
      const secondaryName = 'secondaryName'

      await request(app)
        .post(paths.ABOUT_THE_CHILDREN)
        .send({ [`${formFields.CHILD_NAME}0`]: initialName, [`${formFields.CHILD_NAME}1`]: secondaryName })
        .expect(302)
        .expect('location', paths.ABOUT_THE_ADULTS)

      expect(sessionMock.namesOfChildren).toEqual([initialName, secondaryName])
    })
  })
})
