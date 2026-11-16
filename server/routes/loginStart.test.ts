import { JSDOM } from 'jsdom';
import request from 'supertest';

import config from '../config';
import formFields from '../constants/formFields';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { flashMock, flashMockErrors, sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

describe(paths.LOGIN_START, () => {
  describe('GET', () => {
    it('should render the login start page', async () => {
      const response = await request(app).get(paths.LOGIN_START).expect(200).expect('Content-Type', /html/);

      const { document } = new JSDOM(response.text).window;

      expect(document.querySelector('h1.govuk-heading-l')).toHaveTextContent(
        'Start or continue making a child arrangements plan',
      );
      expect(document.body).toHaveTextContent('You can create and download a child arrangements plan without signing in.');
      expect(document.querySelector('main h2.govuk-heading-m')).toHaveTextContent('What would you like to do?');
      expect(document.querySelector(`label[for="${formFields.LOGIN_START}"]`)).toHaveTextContent(
        'Start a new plan without signing in',
      );
      expect(document.querySelector(`label[for="${formFields.LOGIN_START}-2"]`)).toHaveTextContent(
        'Sign in with GOV.UK One Login to continue an existing plan',
      );
      expect(document.querySelector(`form[action="${paths.LOGIN_START}"] button`)).toHaveTextContent('Continue');
      expect(document.querySelector('h2.govuk-error-summary__title')).toBeNull();
    });

    it('should include a back link to the login start page', async () => {
      const response = await request(app).get(paths.LOGIN_START).expect(200);

      const backLink = new JSDOM(response.text).window.document.querySelector('a.govuk-back-link');

      expect(backLink).not.toBeNull();
      expect(backLink).toHaveAttribute('href', paths.LOGIN_START);
      expect(backLink).toHaveTextContent('Back');
    });

    it('should render error flash responses correctly', async () => {
      Object.assign(flashMockErrors, [
        {
          location: 'body',
          msg: 'Select whether you want to start a new plan or sign in',
          path: formFields.LOGIN_START,
          type: 'field',
        },
      ]);

      const { document } = new JSDOM((await request(app).get(paths.LOGIN_START)).text).window;

      expect(document.querySelector('h2.govuk-error-summary__title')).toHaveTextContent('There is a problem');
      expect(document.querySelector(`#${formFields.LOGIN_START}-error`)).toHaveTextContent(
        'Select whether you want to start a new plan or sign in',
      );
    });
  });

  describe('POST', () => {
    it('should reload the page when no option is selected', async () => {
      await request(app).post(paths.LOGIN_START).expect(302).expect('location', paths.LOGIN_START);

      expect(flashMock).toHaveBeenCalledWith('errors', [
        {
          location: 'body',
          msg: 'Select whether you want to start a new plan or sign in',
          path: formFields.LOGIN_START,
          type: 'field',
        },
      ]);
    });

    it('should continue without signing in when starting a new plan', async () => {
      await request(app)
        .post(paths.LOGIN_START)
        .send({ [formFields.LOGIN_START]: 'start-new-plan' })
        .expect(302)
        .expect('location', paths.CHILDREN_SAFETY_CHECK);

      expect(sessionMock.continueWithoutSignIn).toBe(true);
    });

    it('should redirect to sign in only when continuing an existing plan', async () => {
      sessionMock.returnUrl = paths.TASK_LIST;

      await request(app)
        .post(paths.LOGIN_START)
        .send({ [formFields.LOGIN_START]: 'sign-in' })
        .expect(302)
        .expect('location', paths.SIGN_IN);

      expect(sessionMock.returnUrl).toBe(paths.LOGIN_ACCOUNT);
    });
  });

  describe('when GOV.UK One Login is enabled', () => {
    const originalOneLogin = config.oneLogin;
    const originalUseAuth = config.useAuth;

    beforeEach(() => {
      config.useAuth = true;
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
      delete sessionMock.returnUrl;
    });

    afterEach(() => {
      config.oneLogin = originalOneLogin;
      config.useAuth = originalUseAuth;
      delete sessionMock.continueWithoutSignIn;
      delete sessionMock.returnUrl;
    });

    it('should show the choice page without redirecting to sign in', async () => {
      await request(app).get(paths.LOGIN_START).expect(200);
    });

    it('should not redirect to sign in when starting a new plan', async () => {
      await request(app)
        .post(paths.LOGIN_START)
        .send({ [formFields.LOGIN_START]: 'start-new-plan' })
        .expect(302)
        .expect('location', paths.CHILDREN_SAFETY_CHECK);

      await request(app).get(paths.CHILDREN_SAFETY_CHECK).expect(200);
    });

    it('should redirect to sign in when the existing-plan option is continued', async () => {
      await request(app)
        .post(paths.LOGIN_START)
        .send({ [formFields.LOGIN_START]: 'sign-in' })
        .expect(302)
        .expect('location', paths.SIGN_IN);

      expect(sessionMock.returnUrl).toBe(paths.LOGIN_ACCOUNT);
    });

    it('should ask for a choice before sending another page to sign in', async () => {
      await request(app).get(paths.TASK_LIST).expect(302).expect('location', paths.LOGIN_START);
      expect(sessionMock.returnUrl).toBe(paths.TASK_LIST);
    });
  });
});
