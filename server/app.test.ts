import request from 'supertest'
import { Express } from 'express'

import { JSDOM } from 'jsdom'
import config from './config'

import testAppSetup from './test-utils/testAppSetup'
import paths from './constants/paths'
import cookieNames from './constants/cookieNames'

let app: Express

type languages = 'en' | 'cy'
const homepageLanguageStrings = {
  en: 'Propose a child arrangements plan',
  cy: 'Cynnig cynllun trefniant plentyn',
}

describe('App', () => {
  describe('Language settings', () => {
    describe('when welsh is enabled', () => {
      beforeEach(() => {
        config.includeWelshLanguage = true
        app = testAppSetup()
      })

      it.each(['en', 'cy'])('should return %s when the Accept-Language header is %s', (language: languages) => {
        return request(app)
          .get(paths.START)
          .set('Accept-Language', language)
          .expect(response => {
            expect(response.text).toContain(`lang="${language}"`)
            expect(response.text).toContain(homepageLanguageStrings[language])
          })
      })

      it.each(['en', 'cy'])('should return %s when the lang query parameter is %s', (language: languages) => {
        return request(app)
          .get(`${paths.START}?lang=${language}`)
          .expect(response => {
            expect(response.text).toContain(`lang="${language}"`)
            expect(response.text).toContain(homepageLanguageStrings[language])
          })
      })
    })

    describe('when welsh is disabled', () => {
      beforeEach(() => {
        config.includeWelshLanguage = false
        app = testAppSetup()
      })

      it.each(['en', 'cy'])('should return en when the Accept-Language header is %s', language => {
        return request(app)
          .get(paths.START)
          .set('Accept-Language', language)
          .expect(response => {
            expect(response.text).toContain(`lang="en"`)
            expect(response.text).toContain(homepageLanguageStrings.en)
          })
      })

      it.each(['en', 'cy'])('should return en when the lang query parameter is %s', language => {
        return request(app)
          .get(`${paths.START}?lang=${language}`)
          .expect(response => {
            expect(response.text).toContain(`lang="en"`)
            expect(response.text).toContain(homepageLanguageStrings.en)
          })
      })
    })
  })

  describe('Analytics settings', () => {
    describe('when there is no GA4 ID', () => {
      beforeEach(() => {
        config.analytics.ga4Id = undefined
        app = testAppSetup()
      })

      it.each([undefined, JSON.stringify({ acceptAnalytics: 'No' }), JSON.stringify({ acceptAnalytics: 'Yes' })])(
        'should not show the cookie banner or load GA4 if the consent cookie is %s',
        consentCookie => {
          return request(app)
            .get(paths.START)
            .set('Cookie', `${cookieNames.ANALYTICS_CONSENT}=${consentCookie}`)
            .expect('Content-Type', /html/)
            .expect(response => {
              expect(response.text).not.toContain('www.googletagmanager.com')
              expect(response.text).not.toContain('Cookies on Propose a child arrangements plan')
              expect(response.text).not.toContain('data-ga4-id')
            })
        },
      )
    })

    describe('when there is a GA4 ID', () => {
      const ga4Id = 'test-ga4-id'

      beforeEach(() => {
        config.analytics.ga4Id = ga4Id
        app = testAppSetup()
      })

      it('should show the banner and not load ga4 if the consent cookie does not exist', async () => {
        const response = await request(app).get(paths.START).expect('Content-Type', /html/)

        expect(response.text).not.toContain('www.googletagmanager.com')
        expect(response.text).toContain('Cookies on Propose a child arrangements plan')

        const dom = new JSDOM(response.text)

        expect(dom.window.document.querySelector('body')).toHaveAttribute('data-ga4-id', ga4Id)
      })

      it('should not show the banner and not load ga4 if the consent cookie is no', async () => {
        const response = await request(app)
          .get(paths.START)
          .set('Cookie', `${cookieNames.ANALYTICS_CONSENT}=${JSON.stringify({ acceptAnalytics: 'No' })}`)
          .expect('Content-Type', /html/)

        expect(response.text).not.toContain('www.googletagmanager.com')
        expect(response.text).not.toContain('Cookies on Propose a child arrangements plan')

        const dom = new JSDOM(response.text)

        expect(dom.window.document.querySelector('body')).toHaveAttribute('data-ga4-id', ga4Id)
      })

      it('should not show the banner and load ga4 if the consent cookie is yes', async () => {
        const response = await request(app)
          .get(paths.START)
          .set('Cookie', `${cookieNames.ANALYTICS_CONSENT}=${JSON.stringify({ acceptAnalytics: 'Yes' })}`)
          .expect('Content-Type', /html/)

        expect(response.text).toContain(`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`)
        expect(response.text).not.toContain('Cookies on Propose a child arrangements plan')

        const dom = new JSDOM(response.text)

        expect(dom.window.document.querySelector('body')).toHaveAttribute('data-ga4-id', ga4Id)
      })
    })
  })
})
