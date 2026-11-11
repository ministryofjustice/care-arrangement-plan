import buildOneLoginConfig from './buildOneLoginConfig';

const PRIVATE_KEY = 'test-private-key';

const env = (overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv => ({
  AUTH_PROVIDER: 'one-login',
  ONE_LOGIN_PRIVATE_KEY: PRIVATE_KEY,
  ...overrides,
});

describe('buildOneLoginConfig', () => {
  it('stays disabled unless GOV.UK One Login is the auth provider', () => {
    expect(buildOneLoginConfig({ AUTH_PROVIDER: 'password' }, false)).toEqual({ enabled: false });
  });

  it('uses the local simulator defaults when the issuer is omitted', () => {
    expect(buildOneLoginConfig(env(), false)).toEqual({
      enabled: true,
      issuer: 'http://localhost:3000/',
      clientId: 'HGIOgho9HIRhgoepdIOPFdIUWgewi0jw',
      privateKey: PRIVATE_KEY,
      redirectUrl: 'http://localhost:8001/oidc/authorization-code/callback',
      postLogoutRedirectUrl: 'http://localhost:8001/signed-out',
      scopes: ['openid', 'email'],
      vtr: 'Cl.Cm',
    });
  });

  it('builds localhost callbacks from PORT for the simulator', () => {
    const config = buildOneLoginConfig(env({ PORT: '3001', ONE_LOGIN_ISSUER: 'http://127.0.0.1:3000' }), false);

    expect(config).toMatchObject({
      issuer: 'http://127.0.0.1:3000/',
      redirectUrl: 'http://localhost:3001/oidc/authorization-code/callback',
      postLogoutRedirectUrl: 'http://localhost:3001/signed-out',
    });
  });

  it('requires the integration client id, key, and redirect URLs', () => {
    const issuer = { ONE_LOGIN_ISSUER: 'https://oidc.integration.account.gov.uk' };

    expect(() => buildOneLoginConfig(env(issuer), false)).toThrow('Missing env var ONE_LOGIN_CLIENT_ID');
    expect(() => buildOneLoginConfig(env({ ...issuer, ONE_LOGIN_CLIENT_ID: 'client-id' }), false)).toThrow(
      'Missing env var ONE_LOGIN_REDIRECT_URL',
    );
    expect(() =>
      buildOneLoginConfig(
        env({
          ...issuer,
          ONE_LOGIN_CLIENT_ID: 'client-id',
          ONE_LOGIN_REDIRECT_URL: 'http://localhost:3001/oidc/authorization-code/callback',
        }),
        false,
      ),
    ).toThrow('Missing env var ONE_LOGIN_POST_LOGOUT_REDIRECT_URL');
  });

  it('does not apply simulator defaults in production', () => {
    expect(() => buildOneLoginConfig(env({ ONE_LOGIN_ISSUER: 'http://localhost:3000/' }), true)).toThrow(
      'Missing env var ONE_LOGIN_CLIENT_ID',
    );
  });

  it('keeps openid in the requested scopes and uses a configured vector of trust', () => {
    const config = buildOneLoginConfig(
      env({
        ONE_LOGIN_ISSUER: 'https://oidc.integration.account.gov.uk/',
        ONE_LOGIN_CLIENT_ID: 'client-id',
        ONE_LOGIN_REDIRECT_URL: 'http://localhost:3001/oidc/authorization-code/callback',
        ONE_LOGIN_POST_LOGOUT_REDIRECT_URL: 'http://localhost:3001/signed-out',
        ONE_LOGIN_SCOPES: ' email , phone ',
        ONE_LOGIN_VTR: 'Cl.Cm.P2',
      }),
      false,
    );

    expect(config).toMatchObject({
      enabled: true,
      issuer: 'https://oidc.integration.account.gov.uk/',
      clientId: 'client-id',
      scopes: ['openid', 'email', 'phone'],
      vtr: 'Cl.Cm.P2',
    });
  });

  it('requires a private key for the simulator as well', () => {
    expect(() => buildOneLoginConfig({ AUTH_PROVIDER: 'one-login' }, false)).toThrow(
      'Missing env var ONE_LOGIN_PRIVATE_KEY',
    );
  });
});
