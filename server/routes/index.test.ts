import request from 'supertest';

import config from '../config';
import paths from '../constants/paths';
import testAppSetup from '../test-utils/testAppSetup';

const app = testAppSetup();

describe(`GET ${paths.START}`, () => {
  it('should render index page in non-production', () => {
    return request(app)
      .get(paths.START)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('Propose a child arrangements plan');
      });
  });

  it('should render the index page when the service is live', async () => {
    const originalIsLiveService = config.isLiveService;
    Object.defineProperty(config, 'isLiveService', { value: true, writable: true });

    try {
      await request(app)
        .get(paths.START)
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((response) => {
          expect(response.text).toContain('Start now');
        });
    } finally {
      Object.defineProperty(config, 'isLiveService', { value: originalIsLiveService, writable: true });
    }
  });
});

describe(`POST ${paths.START}`, () => {
  it('should navigate to the login start page', () => {
    return request(app).post(paths.START).expect(302).expect('location', paths.LOGIN_START);
  });

  it('should show the index page and then the login start page when GOV.UK One Login is enabled', async () => {
    const originalOneLogin = config.oneLogin;
    const originalUseAuth = config.useAuth;
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

    try {
      await request(app).get(paths.START).expect(200);
      await request(app).post(paths.START).expect(302).expect('location', paths.LOGIN_START);
    } finally {
      config.oneLogin = originalOneLogin;
      config.useAuth = originalUseAuth;
    }
  });
});
