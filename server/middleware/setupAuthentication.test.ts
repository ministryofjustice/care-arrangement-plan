import { Express } from 'express';
import request from 'supertest';

import config from '../config';
import cookieNames from '../constants/cookieNames';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

let app: Express;

// Local variables

const testPassword = 'testPassword';
const encryptedTestPassword = 'fd5cb51bafd60f6fdbedde6e62c473da6f247db271633e15919bab78a02ee9eb';
const validAuthenticationCookie = `${cookieNames.AUTHENTICATION}=${encryptedTestPassword}`;

describe('When a route is called', () => {
  beforeEach(() => {
    config.useAuth = true;
  });

  describe('and client has no authentication cookie', () => {
    beforeEach(() => {
      config.passwords = [testPassword];
      app = testAppSetup();
    });

    it('should redirect to password page with return url', () => {
      const originalUrl = '/myPage/?param=value';
      const expectedRedirectUrlQueryParameters = 'returnURL=%2FmyPage%2F%3Fparam%3Dvalue';

      return request(app)
        .get(originalUrl)
        .expect(302)
        .expect('location', `${paths.PASSWORD}?${expectedRedirectUrlQueryParameters}`);
    });
  });

  describe('and client has authentication cookie', () => {
    beforeEach(() => {
      config.passwords = [testPassword];
      app = testAppSetup();
    });

    it('should not redirect to password page', () => {
      return request(app).get(`/`).set('Cookie', [validAuthenticationCookie]).expect(200);
    });
  });
});
