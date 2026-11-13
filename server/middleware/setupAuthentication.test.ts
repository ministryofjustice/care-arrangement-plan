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
});
