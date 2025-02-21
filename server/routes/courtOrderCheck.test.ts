import request from 'supertest'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'
import formFields from '../constants/formFields'

const app = testAppSetup()

describe('/court-order-check', () => {
  describe('GET', () => {
    it('should render court order check order page', () => {
      return request(app)
        .get(paths.COURT_ORDER_CHECK)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Do you already have a court order in place about your child arrangements?')
        })
    })
  })

  describe('POST', () => {
    it('should reload page when there is no body', () => {
      return request(app).post(paths.COURT_ORDER_CHECK).expect(302).expect('location', paths.COURT_ORDER_CHECK)
    })

    it('should redirect to existing court order page if the answer is yes', () => {
      return request(app)
        .post(paths.COURT_ORDER_CHECK)
        .send({ [formFields.COURT_ORDER_CHECK]: 'Yes' })
        .expect(302)
        .expect('location', paths.EXISTING_COURT_ORDER)
    })

    it('should redirect to number of children page if the answer is no', () => {
      return (
        request(app)
          .post(paths.COURT_ORDER_CHECK)
          .send({ [formFields.COURT_ORDER_CHECK]: 'No' })
          .expect(302)
          // TODO C5141-759 add correct link
          .expect('location', paths.START)
      )
    })
  })
})
