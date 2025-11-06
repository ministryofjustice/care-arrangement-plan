import request from 'supertest';

import config from '../config';
import cookieNames from '../constants/cookieNames';
import formFields from '../constants/formFields';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { flashMock, flashMockErrors } from '../test-utils/testMocks';

const app = testAppSetup();

const testPassword1 = ['test', 'Password'].join('');
const testPassword2 = ['test', 'Password2'].join('');

const encryptedTestPassword = ['fd5cb51bafd60f6fdbedde6e62c473da6f247db271633e15919bab78a02ee9eb'].join('');

describe('Password Handler', () => {
  describe('GET', () => {
    beforeEach(() => {
      config.useAuth = true;
    });

    it('should return password page without error', () =>
      request(app)
        .get(paths.PASSWORD)
        .expect(200)
        .expect((response) => {
          expect(response.text).toContain('Sign in');
          expect(response.text).not.toContain('The password is not correct');
        }));

    it('should return password page with error if there is an error', () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'The password is not correct',
          path: formFields.PASSWORD,
          type: 'field',
          value: ['incorrect', ' password'].join(''),
        },
      ]);

      return request(app)
        .get(paths.PASSWORD)
        .expect(200)
        .expect((response) => {
          expect(response.text).toContain('The password is not correct');
        });
    });

    describe('POST with no authentication cookie', () => {
      beforeEach(() => {
        config.useAuth = true;
        config.passwords = [testPassword1, testPassword2];
        config.useHttps = true;
      });

      describe('and the password is correct', () => {
        it.each([testPassword1, testPassword2])('should not error with any correct password', (password: string) =>
          request(app).post(paths.PASSWORD).send(`password=${password}`).expect(302).expect('location', '/'),
        );

        it('should redirect to the return url', () => {
          const returnURL = '/myPage';

          return request(app)
            .post(paths.PASSWORD)
            .send({ password: testPassword1, returnURL })
            .expect(302)
            .expect('location', returnURL);
        });

        it('should set authentication cookie', () => {
          const returnURL = '/myPage';
          const authenticatedCookieProperties = [
            `${cookieNames.AUTHENTICATION}=${encryptedTestPassword};`,
            `Max-Age=${60 * 60 * 24 * 30}`,
            `Secure`,
          ];

          return request(app)
            .post(paths.PASSWORD)
            .send({ password: testPassword1, returnURL })
            .expect(302)
            .expect((response) => {
              authenticatedCookieProperties.forEach((p) => expect(response.header['set-cookie'][0]).toContain(p));
            });
        });
      });

      describe('POST and the password is incorrect', () => {
        it('should redirect to the password page with return Url', async () => {
          const returnURL = 'myPage';
          const incorrrectPasswordRedirectUrl = `${paths.PASSWORD}?returnURL=${returnURL}`;
          const incorrectPassword = ['in', 'valid'].join('');

          await request(app)
            .post(`/password`)
            .send({ password: incorrectPassword, returnURL })
            .expect(302)
            .expect('location', incorrrectPasswordRedirectUrl);

          expect(flashMock).toHaveBeenCalledWith('errors', [
            {
              location: 'body',
              msg: 'The password is not correct',
              path: formFields.PASSWORD,
              type: 'field',
              value: incorrectPassword,
            },
          ]);
        });

        it('should set flash error', async () => {
          const incorrectPassword = ['in', 'valid'].join('');
          await request(app).post(`/password`).send({ password: incorrectPassword }).expect(302);

          expect(flashMock).toHaveBeenCalledWith('errors', [
            {
              location: 'body',
              msg: 'The password is not correct',
              path: formFields.PASSWORD,
              type: 'field',
              value: incorrectPassword,
            },
          ]);
        });
      });
    });
  });
});
