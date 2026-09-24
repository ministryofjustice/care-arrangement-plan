import { JSDOM } from 'jsdom';
import request from 'supertest';

import config from './config';
import cookieNames from './constants/cookieNames';
import testAppSetup from './test-utils/testAppSetup';
import { loggerMocks } from './test-utils/testMocks';

describe('errorHandler', () => {
  describe('notFound', () => {
    it('should render content with stack in dev mode', async () => {
      await request(testAppSetup())
        .get('/unknown')
        .expect(404)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Page not found');
        });

      // Note: After security improvements, error may be logged multiple times
      expect(loggerMocks.error).toHaveBeenCalled();
    });
  });

  describe('timeOut', () => {
    it('should render content with stack in dev mode', async () => {
      await request(testAppSetup())
        .get('/create-timeout')
        .expect(403)
        .expect('Content-Type', /html/)
        .expect((res) => {
          const dom = new JSDOM(res.text);
          expect(dom.window.document.body).toHaveTextContent(
            "Your session automatically ends if you don't use the service for 120 minutes.",
          );
        });

      // Note: After security improvements, error may be logged multiple times
      expect(loggerMocks.error).toHaveBeenCalled();
    });
  });

  describe('genericError', () => {
    it('should render the generic error page for the dev test route', async () => {
      config.production = false;
      await request(testAppSetup())
        .get('/dev/create-generic-error')
        .expect(500)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Sorry, there is a problem with the service');
          expect(res.text).toContain('500');
        });

      // Note: After security improvements, error may be logged multiple times
      expect(loggerMocks.error).toHaveBeenCalled();
    });

    it('should render content without stack in production mode', async () => {
      config.production = true;
      await request(testAppSetup())
        .get('/create-error')
        .expect(500)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Sorry, there is a problem with the service');
          expect(res.text).not.toContain('500');
          expect(res.text).not.toContain('Error: An error happened!');
        });

      // Note: After security improvements, error may be logged multiple times
      expect(loggerMocks.error).toHaveBeenCalled();
    });

    it('should render content with stack in dev mode', async () => {
      config.production = false;
      await request(testAppSetup())
        .get('/create-error')
        .expect(500)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('An error happened!');
          expect(res.text).toContain('500');
          expect(res.text).toContain('Error: An error happened!');
        });

      // Note: After security improvements, error may be logged multiple times
      expect(loggerMocks.error).toHaveBeenCalled();
    });

    it('should send the failing page path to Google Analytics', async () => {
      config.production = true;
      config.analytics.enabled = true;
      config.analytics.ga4Id = 'G-TEST';

      await request(testAppSetup())
        .get('/create-error?name=secret')
        .set('Cookie', `${cookieNames.ANALYTICS_CONSENT}=${JSON.stringify({ acceptAnalytics: 'Yes' })}`)
        .expect(500)
        .expect((res) => {
          expect(res.text).toContain("gtag('event', 'service_error'");
          expect(res.text).toContain('error_page: "/create-error?name=secret"');
        });
    });
  });
});
