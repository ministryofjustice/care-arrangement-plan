import request from 'supertest'
import { Express } from 'express'

import config from './config'

import testAppSetup from './test-utils/testAppSetup'

let app: Express

type languages = 'en' | 'cy'
const homepageLanguageStrings = {
  en: 'Propose a child arrangement plan',
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
          .get('/')
          .set('Accept-Language', language)
          .expect(response => {
            expect(response.text).toContain(`lang="${language}"`)
            expect(response.text).toContain(homepageLanguageStrings[language])
          })
      })

      it.each(['en', 'cy'])('should return %s when the lang query parameter is %s', (language: languages) => {
        return request(app)
          .get(`/?lang=${language}`)
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
          .get('/')
          .set('Accept-Language', language)
          .expect(response => {
            expect(response.text).toContain(`lang="en"`)
            expect(response.text).toContain(homepageLanguageStrings.en)
          })
      })

      it.each(['en', 'cy'])('should return en when the lang query parameter is %s', language => {
        return request(app)
          .get(`/?lang=${language}`)
          .expect(response => {
            expect(response.text).toContain(`lang="en"`)
            expect(response.text).toContain(homepageLanguageStrings.en)
          })
      })
    })
  })
})
