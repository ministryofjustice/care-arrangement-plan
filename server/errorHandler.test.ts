import request from 'supertest'
import testAppSetup from './test-utils/testAppSetup'
import config from './config'
import { loggerMocks } from './test-utils/testMocks'

describe('errorHandler', () => {
  describe('notFound', () => {
    it('should render content with stack in dev mode', async () => {
      await request(testAppSetup())
        .get('/unknown')
        .expect(404)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Page not found')
        })

      expect(loggerMocks.error).toHaveBeenCalledTimes(1)
    })
  })

  describe('genericError', () => {
    it('should render content without stack in production mode', async () => {
      config.production = true
      await request(testAppSetup())
        .get('/create-error')
        .expect(500)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Sorry, there is a problem with the service')
          expect(res.text).not.toContain('500')
          expect(res.text).not.toContain('Error: An error happened!')
        })

      expect(loggerMocks.error).toHaveBeenCalledTimes(1)
    })

    it('should render content with stack in dev mode', async () => {
      config.production = false
      await request(testAppSetup())
        .get('/create-error')
        .expect(500)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('An error happened!')
          expect(res.text).toContain('500')
          expect(res.text).toContain('Error: An error happened!')
        })

      expect(loggerMocks.error).toHaveBeenCalledTimes(1)
    })
  })
})
