import request from 'supertest';

import config from '../config';
import cookieNames from '../constants/cookieNames';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';

// Local variables

const testPassword = ['test', 'Password'].join('');
const encryptedTestPassword = ['fd5cb51bafd60f6fdbedde6e62c473da6f247db271633e15919bab78a02ee9eb'].join('');
const validAuthenticationCookie = `${cookieNames.AUTHENTICATION}=${encryptedTestPassword}`;
const app = testAppSetup();

describe('When a route is called', () => {
  beforeEach(() => {
    config.useAuth = true;
  });

  describe('and client has no authentication cookie', () => {
    beforeEach(() => {
      config.passwords = [testPassword];
    });

    it('should redirect to the password page and keep an allowlisted return url', async () => {
      await request(app).get(paths.TASK_LIST).expect(302).expect('location', paths.PASSWORD);

      expect(sessionMock.returnUrl).toBe(paths.TASK_LIST);
    });

    it('should redirect to the password page and drop a return url outside this service', async () => {
      await request(app).get('/myPage/?param=value').expect(302).expect('location', paths.PASSWORD);

      expect(sessionMock.returnUrl).toBe(paths.START);
    });
  });

  describe('and client has authentication cookie', () => {
    beforeEach(() => {
      config.passwords = [testPassword];
    });

    it('should not redirect to password page', () => {
      return request(app).get(`/`).set('Cookie', [validAuthenticationCookie]).expect(200);
    });
  });

  describe('and GOV.UK One Login is enabled', () => {
    const originalOneLogin = config.oneLogin;

    beforeEach(() => {
      config.oneLogin = {
        enabled: true,
        issuer: 'http://localhost:3000/',
        clientId: 'test-client',
        privateKey: 'test-key',
        redirectUrl: 'http://localhost:8001/oidc/authorization-code/callback',
        postLogoutRedirectUrl: 'http://localhost:8001/signed-out',
        scopes: ['openid', 'email'],
        vtr: 'Cl.Cm',
      };
    });

    afterEach(() => {
      config.oneLogin = originalOneLogin;
    });

    it('should redirect to GOV.UK One Login instead of the password page', async () => {
      await request(app)
        .get(paths.START)
        .set('Cookie', [validAuthenticationCookie])
        .expect(302)
        .expect('location', paths.SIGN_IN);

      expect(sessionMock.returnUrl).toBe(paths.START);
    });

    it('should allow a user who has signed in with GOV.UK One Login', () => {
      sessionMock.oneLogin = { sub: 'user-1', idToken: 'id-token' };

      return request(app).get(paths.START).expect(200);
    });
  });
});
