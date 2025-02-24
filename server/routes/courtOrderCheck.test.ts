import request from 'supertest'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'
import formFields from '../constants/formFields'
import { flashMock } from '../test-utils/testMocks'

const app = testAppSetup()

describe(paths.COURT_ORDER_CHECK, () => {
  describe('GET', () => {
    it('should render court order check page', () => {
      return request(app)
        .get(paths.COURT_ORDER_CHECK)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Do you already have a court order in place about your child arrangements?')
        })
    })
  })

  describe('POST', () => {
    it('should reload page and set flash when there is no body', async () => {
      await request(app).post(paths.COURT_ORDER_CHECK).expect(302).expect('location', paths.COURT_ORDER_CHECK)

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Invalid value',
          path: formFields.COURT_ORDER_CHECK,
          type: 'field',
        },
      ])
    })

    it('should redirect to existing court order page if the answer is yes', () => {
      return request(app)
        .post(paths.COURT_ORDER_CHECK)
        .send({ [formFields.COURT_ORDER_CHECK]: 'Yes' })
        .expect(302)
        .expect('location', paths.EXISTING_COURT_ORDER)
    })

    it('should redirect to number of children page if the answer is no', () => {
      return request(app)
        .post(paths.COURT_ORDER_CHECK)
        .send({ [formFields.COURT_ORDER_CHECK]: 'No' })
        .expect(302)
        .expect('location', paths.NUMBER_OF_CHILDREN)
    })
  })
})
