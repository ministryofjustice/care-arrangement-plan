import request from 'supertest';

import config from '../config';
import cookieNames from '../constants/cookieNames';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';
import encryptPassword from '../utils/encryptPassword';

const testPassword = ['test', 'Password'].join('');
const app = testAppSetup();

describe('When a route is called', () => {
  beforeEach(() => {
    config.useAuth = true;
  });

  describe('and client has no authentication cookie', () => {
    beforeEach(() => {
      config.passwords = [testPassword];
    });

    it('should redirect to the password page and remember only an application path', () => {
      return request(app)
        .get(`${paths.TASK_LIST}?param=value`)
        .expect(302)
        .expect('location', paths.PASSWORD)
        .expect(() => {
          expect(sessionMock.returnUrl).toBe(`${paths.TASK_LIST}?param=value`);
        });
    });

    it('should not copy an unknown address into the redirect', () => {
      return request(app)
        .get('/myPage/?param=value')
        .expect(302)
        .expect('location', paths.PASSWORD)
        .expect(() => {
          expect(sessionMock.returnUrl).toBe(paths.START);
        });
    });
  });

  describe('and client has authentication cookie', () => {
    beforeEach(() => {
      config.passwords = [testPassword];
    });

    it('should not redirect to password page', () => {
      return request(app)
        .get(`/`)
        .set('Cookie', [`${cookieNames.AUTHENTICATION}=${encryptPassword(testPassword)}`])
        .expect(200);
    });
  });

  describe('and GOV.UK One Login is enabled', () => {
    const originalOneLogin = config.oneLogin;

    beforeEach(() => {
      config.oneLogin = {
        enabled: true,
        issuer: 'https://issuer.example/',
        clientId: 'client-id',
        privateKey: 'private-key',
        redirectUrl: 'http://localhost:3001/oidc/authorization-code/callback',
        postLogoutRedirectUrl: 'http://localhost:3001/signed-out',
        scopes: ['openid', 'email'],
        vtr: 'Cl.Cm',
      };
      delete sessionMock.oneLogin;
      delete sessionMock.continueWithoutSignIn;
    });

    afterEach(() => {
      config.oneLogin = originalOneLogin;
      delete sessionMock.continueWithoutSignIn;
    });

    it('should send the user to the sign-in choice rather than straight to GOV.UK One Login', () => {
      return request(app).get(paths.TASK_LIST).expect(302).expect('location', paths.LOGIN_START);
    });
  });
});
