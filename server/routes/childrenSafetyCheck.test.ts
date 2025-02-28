import request from 'supertest'
import { JSDOM } from 'jsdom'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'
import formFields from '../constants/formFields'
import { flashMock, flashMockErrors } from '../test-utils/testMocks'

const app = testAppSetup()

describe(paths.CHILDREN_SAFETY_CHECK, () => {
  describe('GET', () => {
    it('should render children safety check page', async () => {
      const response = await request(app).get(paths.CHILDREN_SAFETY_CHECK).expect('Content-Type', /html/)

      const dom = new JSDOM(response.text)

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Children’s safety')
      expect(dom.window.document.querySelector('h2')).toBeNull()
      expect(dom.window.document.querySelector('fieldset')).not.toHaveAttribute('aria-describedby')
    })

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.CHILDREN_SAFETY_CHECK,
          type: 'field',
        },
      ])

      const dom = new JSDOM((await request(app).get(paths.CHILDREN_SAFETY_CHECK)).text)

      expect(dom.window.document.querySelector('h2')).toHaveTextContent('There is a problem')
      expect(dom.window.document.querySelector('fieldset')).toHaveAttribute(
        'aria-describedby',
        `${formFields.CHILDREN_SAFETY_CHECK}-error`,
      )
    })
  })

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app).post(paths.CHILDREN_SAFETY_CHECK).expect(302).expect('location', paths.CHILDREN_SAFETY_CHECK)

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.CHILDREN_SAFETY_CHECK,
          type: 'field',
        },
      ])
    })

    it('should redirect to do whats best page if the answer is yes', () => {
      return request(app)
        .post(paths.CHILDREN_SAFETY_CHECK)
        .send({ [formFields.CHILDREN_SAFETY_CHECK]: 'Yes' })
        .expect(302)
        .expect('location', paths.DO_WHATS_BEST)
    })

    it('should redirect to children not sage page if the answer is no', () => {
      return request(app)
        .post(paths.CHILDREN_SAFETY_CHECK)
        .send({ [formFields.CHILDREN_SAFETY_CHECK]: 'No' })
        .expect(302)
        .expect('location', paths.CHILDREN_NOT_SAFE)
    })
  })
})

describe(`GET ${paths.CHILDREN_NOT_SAFE}`, () => {
  it('should render not safe page', () => {
    return request(app)
      .get(paths.CHILDREN_NOT_SAFE)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Getting help')
      })
  })
})
