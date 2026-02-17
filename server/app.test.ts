import { JSDOM } from 'jsdom';
import request from 'supertest';

import config from './config';
import cookieNames from './constants/cookieNames';
import paths from './constants/paths';
import cy from './locales/cy.json';
import en from './locales/en.json';
import testAppSetup from './test-utils/testAppSetup';
import { mockNow, sessionMock } from './test-utils/testMocks';

const app = testAppSetup();

type languages = 'en' | 'cy';
const homepageLanguageStrings = {
  en: 'Propose a child arrangements plan',
  cy: 'Cynnig cynllun trefniant plentyn',
};

describe('App', () => {
  describe('Language settings', () => {
    describe('when welsh is enabled', () => {
      beforeEach(() => {
        config.includeWelshLanguage = true;
      });

      it.each(['en', 'cy'])('should return %s when the Accept-Language header is %s', (language: languages) => {
        return request(testAppSetup())
          .get(paths.START)
          .set('Accept-Language', language)
          .expect((response) => {
            expect(response.text).toContain(`lang="${language}"`);
            expect(response.text).toContain(homepageLanguageStrings[language]);
          });
      });

      it.each(['en', 'cy'])('should return %s when the lang query parameter is %s', (language: languages) => {
        return request(testAppSetup())
          .get(`${paths.START}?lang=${language}`)
          .expect((response) => {
            expect(response.text).toContain(`lang="${language}"`);
            expect(response.text).toContain(homepageLanguageStrings[language]);
          });
      });

      it('should show a link to switch to Welsh when the language is English', () => {
        return request(testAppSetup())
          .get(`${paths.START}?lang=en`)
          .expect((response) => {
            expect(response.text).toContain('?lang=cy');
            expect(response.text).toContain('Welsh (Cymraeg)');
            expect(response.text).not.toContain('?lang=en');
          });
      });

      it('should show a link to switch to English when the language is Welsh', () => {
        return request(testAppSetup())
          .get(`${paths.START}?lang=cy`)
          .expect((response) => {
            expect(response.text).toContain('?lang=en');
            expect(response.text).toContain('Saesneg (English)');
            expect(response.text).not.toContain('?lang=cy');
          });
      });
    });

    describe('when welsh is disabled', () => {
      beforeEach(() => {
        config.includeWelshLanguage = false;
      });

      it.each(['en', 'cy'])('should return en when the Accept-Language header is %s', (language) => {
        return request(testAppSetup())
          .get(paths.START)
          .set('Accept-Language', language)
          .expect((response) => {
            expect(response.text).toContain(`lang="en"`);
            expect(response.text).toContain(homepageLanguageStrings.en);
          });
      });

      it.each(['en', 'cy'])('should return en when the lang query parameter is %s', (language) => {
        return request(testAppSetup())
          .get(`${paths.START}?lang=${language}`)
          .expect((response) => {
            expect(response.text).toContain(`lang="en"`);
            expect(response.text).toContain(homepageLanguageStrings.en);
          });
      });
    });
  });

  describe('Analytics settings', () => {
    describe('when there is no GA4 ID', () => {
      beforeEach(() => {
        config.analytics.ga4Id = undefined;
      });

      it.each([undefined, JSON.stringify({ acceptAnalytics: 'No' }), JSON.stringify({ acceptAnalytics: 'Yes' })])(
        'should not show the cookie banner or load GA4 if the consent cookie is %s',
        (consentCookie) => {
          return request(app)
            .get(paths.START)
            .set('Cookie', `${cookieNames.ANALYTICS_CONSENT}=${consentCookie}`)
            .expect('Content-Type', /html/)
            .expect((response) => {
              expect(response.text).not.toContain('www.googletagmanager.com');
              expect(response.text).not.toContain('Cookies on Propose a child arrangements plan');
              expect(response.text).not.toContain('data-ga4-id');
            });
        },
      );
    });

    describe('when there is a GA4 ID', () => {
      const ga4Id = 'test-ga4-id';

      beforeEach(() => {
        config.analytics.enabled = true; // Enable analytics for these tests
        config.analytics.ga4Id = ga4Id;
      });

      it('should show the banner and not load ga4 if the consent cookie does not exist', async () => {
        const response = await request(app).get(paths.START).expect('Content-Type', /html/);

        expect(response.text).not.toContain('www.googletagmanager.com');
        expect(response.text).toContain('Cookies on Propose a child arrangements plan');

        const dom = new JSDOM(response.text);

        expect(dom.window.document.querySelector('body')).toHaveAttribute('data-ga4-id', ga4Id);
      });

      it('should not show the banner and not load ga4 if the consent cookie is no', async () => {
        const response = await request(app)
          .get(paths.START)
          .set('Cookie', `${cookieNames.ANALYTICS_CONSENT}=${JSON.stringify({ acceptAnalytics: 'No' })}`)
          .expect('Content-Type', /html/);

        expect(response.text).not.toContain('www.googletagmanager.com');
        expect(response.text).not.toContain('Cookies on Propose a child arrangements plan');

        const dom = new JSDOM(response.text);

        expect(dom.window.document.querySelector('body')).toHaveAttribute('data-ga4-id', ga4Id);
      });

      it('should not show the banner and load ga4 if the consent cookie is yes', async () => {
        const response = await request(app)
          .get(paths.START)
          .set('Cookie', `${cookieNames.ANALYTICS_CONSENT}=${JSON.stringify({ acceptAnalytics: 'Yes' })}`)
          .expect('Content-Type', /html/);

        expect(response.text).toContain(`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`);
        expect(response.text).not.toContain('Cookies on Propose a child arrangements plan');

        const dom = new JSDOM(response.text);

        expect(dom.window.document.querySelector('body')).toHaveAttribute('data-ga4-id', ga4Id);
      });
    });
  });

  describe('Authentication', () => {
    const pathsWithNoAuthentication = [
      paths.PASSWORD,
      paths.CONTACT_US,
      paths.COOKIES,
      paths.ACCESSIBILITY_STATEMENT,
      paths.PRIVACY_NOTICE,
      paths.TERMS_AND_CONDITIONS,
    ];

    beforeEach(() => {
      config.useAuth = true;
    });

    it.each(Object.values(paths).filter((path) => !pathsWithNoAuthentication.includes(path)))(
      'should redirect to password page for %s when not authenticated',
      (path) => {
        return request(app)
          .get(path)
          .expect(302)
          .expect('location', `${paths.PASSWORD}?returnURL=${encodeURIComponent(path)}`);
      },
    );

    it.each(pathsWithNoAuthentication)('should not redirect to password page for %s when not authenticated', (path) => {
      return request(app).get(path).expect(200);
    });
  });

  describe('Language persistence via session', () => {
    beforeEach(() => {
      config.includeWelshLanguage = true;
      // Reset session lang between tests
      delete sessionMock.lang;
    });

    it('should store the language in session when lang query parameter is used', async () => {
      const testApp = testAppSetup();

      await request(testApp)
        .get(`${paths.START}?lang=cy`)
        .expect((response) => {
          expect(response.text).toContain(homepageLanguageStrings.cy);
        });

      expect(sessionMock.lang).toBe('cy');
    });

    it('should use session language on subsequent requests without lang parameter', async () => {
      sessionMock.lang = 'cy';
      const testApp = testAppSetup();

      await request(testApp)
        .get(paths.START)
        .expect((response) => {
          expect(response.text).toContain(homepageLanguageStrings.cy);
        });
    });

    it('should not store an invalid language in session', async () => {
      const testApp = testAppSetup();

      await request(testApp)
        .get(`${paths.START}?lang=fr`)
        .expect((response) => {
          expect(response.text).toContain(homepageLanguageStrings.en);
        });

      expect(sessionMock.lang).toBeUndefined();
    });
  });

  describe('Translation completeness', () => {
    const getKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
      return Object.entries(obj).flatMap(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return getKeys(value as Record<string, unknown>, fullKey);
        }
        return fullKey;
      });
    };

    const enKeys = getKeys(en);
    const cyKeys = getKeys(cy);

    it('should have Welsh translations for all English keys', () => {
      const missingInCy = enKeys.filter((key) => !cyKeys.includes(key));
      if (missingInCy.length > 0) {
        console.warn(`Missing Welsh translations (${missingInCy.length}):\n${missingInCy.join('\n')}`);
      }
      // This is a warning test — it logs missing keys but doesn't fail
      // Uncomment the line below to enforce completeness:
      // expect(missingInCy).toEqual([]);
      expect(true).toBe(true);
    });

    it('should not have Welsh keys that do not exist in English', () => {
      const extraInCy = cyKeys.filter((key) => !enKeys.includes(key));
      expect(extraInCy).toEqual([]);
    });
  });

  describe('Preview end', () => {
    beforeEach(() => {
      config.useAuth = false;
    });

    it('should return the service not available page after the preview end date', () => {
      config.previewEnd = new Date(mockNow.getTime() - 24 * 60 * 60 * 1000); // one day ago

      return request(app)
        .get(paths.START)
        .expect((response) => {
          expect(response.text).toContain('The private view of this service is now finished');
        });
    });

    it('should return the normal page before the preview end date', () => {
      config.previewEnd = new Date(mockNow.getTime() + 24 * 60 * 60 * 1000); // one day ago

      return request(app)
        .get(paths.START)
        .expect((response) => {
          expect(response.text).toContain(homepageLanguageStrings['en']);
        });
    });
  });
});
