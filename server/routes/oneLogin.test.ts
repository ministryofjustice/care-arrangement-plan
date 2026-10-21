import request from 'supertest';

import config from '../config';
import paths from '../constants/paths';
import { buildAuthorizeUrl, buildLogoutUrl, completeAuthorization, createAuthorizeRequest } from '../oneLogin/client';
import { openOneLoginTransaction, sealOneLoginTransaction } from '../oneLogin/transaction';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';

jest.mock('../oneLogin/client', () => ({
  buildAuthorizeUrl: jest.fn(),
  buildLogoutUrl: jest.fn(),
  completeAuthorization: jest.fn(),
  createAuthorizeRequest: jest.fn(),
}));

const app = testAppSetup();
const originalOneLogin = config.oneLogin;

const enabledOneLogin = {
  enabled: true as const,
  issuer: 'http://localhost:3000/',
  clientId: 'test-client',
  privateKey: 'unused-by-these-tests',
  redirectUrl: 'http://localhost:8001/oidc/authorization-code/callback',
  postLogoutRedirectUrl: 'http://localhost:8001/signed-out',
  scopes: ['openid', 'email'],
  vtr: 'Cl.Cm',
};

describe('GOV.UK One Login routes', () => {
  beforeEach(() => {
    config.useAuth = true;
    config.oneLogin = enabledOneLogin;
    jest.mocked(createAuthorizeRequest).mockReturnValue({
      nonce: 'nonce-1',
      state: 'state-1',
      codeVerifier: 'verifier-1',
      codeChallenge: 'challenge-1',
    });
    jest.mocked(buildAuthorizeUrl).mockResolvedValue('http://localhost:3000/authorize?client_id=test-client');
    jest.mocked(completeAuthorization).mockResolvedValue({
      idToken: 'id-token',
      user: { sub: 'user-1', email: 'test@example.com', emailVerified: true },
    });
    jest.mocked(buildLogoutUrl).mockResolvedValue('http://localhost:3000/logout');
  });

  afterEach(() => {
    config.oneLogin = originalOneLogin;
  });

  it('starts an authorize request and remembers where to return', async () => {
    await request(app)
      .get(`${paths.SIGN_IN}?returnURL=${encodeURIComponent(paths.TASK_LIST)}`)
      .expect(302)
      .expect('location', 'http://localhost:3000/authorize?client_id=test-client');

    expect(buildAuthorizeUrl).toHaveBeenCalledWith({
      nonce: 'nonce-1',
      state: expect.any(String),
      codeChallenge: 'challenge-1',
      locale: 'en',
    });
    const state = jest.mocked(buildAuthorizeUrl).mock.calls[0][0].state;
    expect(openOneLoginTransaction(state, config.session.secret)).toEqual({
      nonce: 'nonce-1',
      codeVerifier: 'verifier-1',
      returnUrl: paths.TASK_LIST,
    });
  });

  it('uses the return url stored when authentication was required', async () => {
    sessionMock.returnUrl = paths.TASK_LIST;

    await request(app).get(paths.SIGN_IN).expect(302);

    const state = jest.mocked(buildAuthorizeUrl).mock.calls[0][0].state;
    expect(openOneLoginTransaction(state, config.session.secret)?.returnUrl).toBe(paths.TASK_LIST);
  });

  it('does not redirect to an authorize address outside the configured issuer', async () => {
    jest.mocked(buildAuthorizeUrl).mockResolvedValue('https://evil.example/authorize');

    const response = await request(app).get(paths.SIGN_IN).expect(502);

    expect(response.headers.location).toBeUndefined();
    expect(response.text).toContain('There is a problem signing you in');
  });

  it('keeps only the allowlisted path from the return URL parameter', async () => {
    await request(app)
      .get(`${paths.SIGN_IN}?returnURL=${encodeURIComponent(`${paths.TASK_LIST}?next=https://evil.example`)}`)
      .expect(302);

    const state = jest.mocked(buildAuthorizeUrl).mock.calls[0][0].state;
    expect(openOneLoginTransaction(state, config.session.secret)?.returnUrl).toBe(paths.TASK_LIST);
  });

  it('ignores a return URL outside this service', async () => {
    await request(app)
      .get(`${paths.SIGN_IN}?returnURL=${encodeURIComponent('https://evil.example')}`)
      .expect(302);

    const state = jest.mocked(buildAuthorizeUrl).mock.calls[0][0].state;
    expect(openOneLoginTransaction(state, config.session.secret)?.returnUrl).toBe(paths.START);
  });

  it('signs the user in when the simulator returns the sign-in state', async () => {
    const state = sealOneLoginTransaction(
      { nonce: 'nonce-1', codeVerifier: 'verifier-1', returnUrl: paths.TASK_LIST },
      config.session.secret,
    );

    await request(app)
      .get(`${paths.ONE_LOGIN_CALLBACK}?code=auth-code&state=${encodeURIComponent(state)}`)
      .expect(302)
      .expect('location', paths.TASK_LIST);

    expect(completeAuthorization).toHaveBeenCalledWith({
      code: 'auth-code',
      codeVerifier: 'verifier-1',
      nonce: 'nonce-1',
    });
    expect(sessionMock.oneLogin).toEqual({
      sub: 'user-1',
      email: 'test@example.com',
      emailVerified: true,
      idToken: 'id-token',
    });
    expect(sessionMock.regenerate).toHaveBeenCalled();
  });

  it('redirects to the allowlisted path and drops the rest of the saved return URL', async () => {
    const state = sealOneLoginTransaction(
      {
        nonce: 'nonce-1',
        codeVerifier: 'verifier-1',
        returnUrl: `${paths.TASK_LIST}?next=https://evil.example`,
      },
      config.session.secret,
    );

    await request(app)
      .get(`${paths.ONE_LOGIN_CALLBACK}?code=auth-code&state=${encodeURIComponent(state)}`)
      .expect(302)
      .expect('location', paths.TASK_LIST);
  });

  it('does not show the provider error on the problem page', async () => {
    const response = await request(app)
      .get(
        `${paths.ONE_LOGIN_CALLBACK}?error=access_denied&error_description=${encodeURIComponent('<script>alert(1)</script>')}`,
      )
      .expect(400);

    expect(response.text).toContain('There is a problem signing you in');
    expect(response.text).not.toContain('access_denied');
    expect(response.text).not.toContain('<script>alert(1)</script>');
    expect(completeAuthorization).not.toHaveBeenCalled();
  });

  it('rejects a callback whose state cannot be read', async () => {
    await request(app).get(`${paths.ONE_LOGIN_CALLBACK}?code=auth-code&state=other-state`).expect(400);
    expect(sessionMock.oneLogin).toBeUndefined();
    expect(completeAuthorization).not.toHaveBeenCalled();
  });

  it('signs out through the simulator and shows the signed-out page', async () => {
    sessionMock.oneLogin = { sub: 'user-1', idToken: 'id-token' };

    await request(app).get(paths.SIGN_OUT).expect(302).expect('location', 'http://localhost:3000/logout');
    expect(buildLogoutUrl).toHaveBeenCalledWith('id-token');
    expect(sessionMock.destroy).toHaveBeenCalled();

    const response = await request(app).get(paths.SIGNED_OUT).expect(200);
    expect(response.text).toContain('You have signed out');
  });

  it('does not redirect sign-out to an address outside the configured issuer', async () => {
    sessionMock.oneLogin = { sub: 'user-1', idToken: 'id-token' };
    jest.mocked(buildLogoutUrl).mockResolvedValue('https://evil.example/logout');

    const response = await request(app).get(paths.SIGN_OUT).expect(502);

    expect(response.headers.location).toBeUndefined();
    expect(response.text).toContain('There is a problem signing you in');
    expect(sessionMock.destroy).not.toHaveBeenCalled();
  });

  it('shows a sign out link after the user has signed in', async () => {
    sessionMock.oneLogin = { sub: 'user-1', idToken: 'id-token' };

    const response = await request(app).get(paths.START).expect(200);

    expect(response.text).toContain(paths.SIGN_OUT);
    expect(response.text).toContain('Sign out');
  });
});
