import request from 'supertest'
import { JSDOM } from 'jsdom'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'
import formFields from '../constants/formFields'
import { flashFormValues, flashMock, flashMockErrors, sessionMock } from '../test-utils/testMocks'

const app = testAppSetup()

describe(paths.NUMBER_OF_CHILDREN, () => {
  describe('GET', () => {
    it('should render number of children page', () => {
      return request(app)
        .get(paths.NUMBER_OF_CHILDREN)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('How many children is this for?')
          expect(response.text).not.toContain('There is a problem')
        })
    })

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.NUMBER_OF_CHILDREN,
          type: 'field',
          value: 7,
        },
      ])
      Object.assign(flashFormValues, [{ [formFields.NUMBER_OF_CHILDREN]: '7' }])

      const dom = new JSDOM((await request(app).get(paths.NUMBER_OF_CHILDREN)).text)

      expect(dom.window.document.querySelector(`#${formFields.NUMBER_OF_CHILDREN}`)).toHaveAttribute('value', '7')
    })
  })

  describe('POST', () => {
    it.each(['', 'abc', '7', '6!', '0'])(
      "should reload page and set flash when the number of children is '%s'",
      async numberOfChildren => {
        await request(app)
          .post(paths.NUMBER_OF_CHILDREN)
          .send({ [formFields.NUMBER_OF_CHILDREN]: numberOfChildren })
          .expect(302)
          .expect('location', paths.NUMBER_OF_CHILDREN)

        expect(flashMock).toHaveBeenCalledWith('errors', [
          {
            location: 'body',
            msg: 'Invalid value',
            path: formFields.NUMBER_OF_CHILDREN,
            type: 'field',
            value: numberOfChildren,
          },
        ])
        expect(flashMock).toHaveBeenCalledWith('formValues', { [formFields.NUMBER_OF_CHILDREN]: numberOfChildren })
      },
    )

    it.each([
      ['6', 6],
      ['1', 1],
      ['  2  ', 2],
    ])(
      "should redirect to about the children page and set session data if the number of children is '%s'",
      async (numberOfChildrenBody, numberOfChildren) => {
        await request(app)
          .post(paths.NUMBER_OF_CHILDREN)
          .send({ [formFields.NUMBER_OF_CHILDREN]: numberOfChildrenBody })
          .expect(302)
          .expect('location', paths.ABOUT_THE_CHILDREN)

        expect(sessionMock.numberOfChildren).toEqual(numberOfChildren)
      },
    )
  })
})
