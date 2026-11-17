import { JSDOM } from 'jsdom';
import request from 'supertest';

import formFields from '../constants/formFields';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();

describe(paths.LOGIN_ACCOUNT, () => {
  describe('GET', () => {
    it('should render the login account page', async () => {
      const response = await request(app).get(paths.LOGIN_ACCOUNT).expect(200).expect('Content-Type', /html/);

      const { document } = new JSDOM(response.text).window;

      expect(document.querySelector('h1')).toHaveTextContent('Your child arrangements plans');
      expect(document.body).toHaveTextContent('Create and manage child arrangements plans for your children.');
      expect(document.querySelector(`form[action="${paths.LOGIN_START}"] button`)).toHaveTextContent(
        'Create a new plan',
      );
      expect(document.querySelector(`input[name="${formFields.LOGIN_START}"]`)).toHaveValue('start-new-plan');
    });

    it('should render the saved plan and its actions', async () => {
      const response = await request(app).get(paths.LOGIN_ACCOUNT).expect(200);

      const { document } = new JSDOM(response.text).window;

      expect(document.body).toHaveTextContent('Jason and Amelia');
      expect(document.body).toHaveTextContent('Harrison and Jennifer');
      expect(document.body).toHaveTextContent('In progress');
      expect(document.body).toHaveTextContent('23 October 2026');
      expect(document.body).toHaveTextContent('Continue plan');
      const continuePlan = Array.from(document.querySelectorAll('a')).find((link) =>
        link.textContent?.includes('Continue plan'),
      );
      expect(continuePlan).toHaveAttribute('href', paths.LOGIN_ACCOUNT);
      expect(document.body).toHaveTextContent('Delete this plan');
    });

    it('should show account links and sign out when the user is signed in', async () => {
      sessionMock.oneLogin = { sub: 'user-1', email: 'person@example.com', idToken: 'token' };

      const response = await request(app).get(paths.LOGIN_ACCOUNT).expect(200);
      const { document } = new JSDOM(response.text).window;
      const serviceNavigation = document.querySelector('.govuk-service-navigation');
      const plansLink = serviceNavigation?.querySelector(`a[href="${paths.LOGIN_ACCOUNT}"]`);
      const detailsLink = serviceNavigation?.querySelector(`a[href="${paths.LOGIN_YOUR_DETAILS}"]`);
      const oneLoginHeader = document.querySelector('.one-login-header__nav');
      const signOut = oneLoginHeader?.querySelector('.one-login-header__nav__text--sign-out');

      expect(plansLink).toHaveTextContent('Your child arrangements plans');
      expect(plansLink).toHaveAttribute('aria-current', 'page');
      expect(detailsLink).toHaveTextContent('Your details');
      expect(detailsLink).not.toHaveAttribute('aria-current');
      expect(oneLoginHeader).toHaveTextContent('GOV.UK One Login');
      expect(signOut).toHaveTextContent('Sign out');
      expect(signOut?.closest('a')).toHaveAttribute('href', paths.SIGN_OUT);
      expect(document.querySelector('.govuk-header__navigation')).toBeNull();
      expect(document.querySelector('main')).not.toHaveTextContent('Sign out');

      delete sessionMock.oneLogin;
    });

    it('should not show account links before the user signs in', async () => {
      delete sessionMock.oneLogin;

      const response = await request(app).get(paths.LOGIN_ACCOUNT).expect(200);
      const { document } = new JSDOM(response.text).window;

      expect(document.querySelector('.one-login-header__nav')).toBeNull();
      expect(document.querySelector('.govuk-header__navigation')).toBeNull();
      expect(document.querySelector('.govuk-service-navigation__list')).toBeNull();
    });
  });

  describe(`GET ${paths.LOGIN_YOUR_DETAILS}`, () => {
    it('should mark Your details as the current account link', async () => {
      sessionMock.oneLogin = { sub: 'user-1', email: 'person@example.com', idToken: 'token' };

      const response = await request(app).get(paths.LOGIN_YOUR_DETAILS).expect(200);
      const { document } = new JSDOM(response.text).window;
      const serviceNavigation = document.querySelector('.govuk-service-navigation');

      expect(document.querySelector('h1')).toHaveTextContent('Your details');
      expect(document.body).toHaveTextContent('person@example.com');
      expect(serviceNavigation?.querySelector(`a[href="${paths.LOGIN_YOUR_DETAILS}"]`)).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(serviceNavigation?.querySelector(`a[href="${paths.LOGIN_ACCOUNT}"]`)).not.toHaveAttribute('aria-current');

      delete sessionMock.oneLogin;
    });
  });
});
