import request from 'supertest'
import { JSDOM } from 'jsdom'
import testAppSetup from '../test-utils/testAppSetup'
import paths from '../constants/paths'
import formFields from '../constants/formFields'
import config from '../config'

const app = testAppSetup()

const mockDate = new Date('2025-01-01T00:00:00Z')

describe(paths.COOKIES, () => {
  describe('GET', () => {
    it('should render cookies page when there is no ga4 id', async () => {
      config.analytics.ga4Id = undefined

      const response = await request(app).get(paths.COOKIES).expect('Content-Type', /html/)

      const dom = new JSDOM(response.text)

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Cookies')
      expect(dom.window.document.querySelector('fieldset')).toBeNull()
    })

    it('should render cookies page when there is no ga4 id', async () => {
      config.analytics.ga4Id = 'test-ga4-id'

      const response = await request(app).get(paths.COOKIES).expect('Content-Type', /html/)

      const dom = new JSDOM(response.text)

      expect(dom.window.document.querySelector('h1')).toHaveTextContent('Cookies')
      expect(dom.window.document.querySelector('fieldset')).not.toBeNull()
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] }).setSystemTime(mockDate)
    })

    it('should reload page and set cookies when the response is Yes', async () => {
      config.analytics.ga4Id = 'test-ga4-id'
      await request(app)
        .post(paths.COOKIES)
        .send({ [formFields.ACCEPT_OPTIONAL_COOKIES]: 'Yes' })
        .expect(302)
        .expect('location', paths.COOKIES)
        .expect(response => {
          expect(response.header['set-cookie']).toEqual([
            `cookie_policy=${encodeURIComponent(JSON.stringify({ acceptAnalytics: 'Yes' }))}; Path=/; Expires=Thu, 01 Jan 2026 00:00:00 GMT`,
          ])
        })
    })

    it('should reload page and set cookies when the response is No', async () => {
      config.analytics.ga4Id = 'test-ga4-id'
      await request(app)
        .post(paths.COOKIES)
        .send({ [formFields.ACCEPT_OPTIONAL_COOKIES]: 'No' })
        .expect(302)
        .expect('location', paths.COOKIES)
        .expect(response => {
          expect(response.header['set-cookie']).toEqual([
            `cookie_policy=${encodeURIComponent(JSON.stringify({ acceptAnalytics: 'No' }))}; Path=/; Expires=Thu, 01 Jan 2026 00:00:00 GMT`,
            '_ga=; Domain=127.0.0.1; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
            `_ga_${config.analytics.ga4Id}=; Domain=127.0.0.1; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
          ])
        })
    })
  })
})
