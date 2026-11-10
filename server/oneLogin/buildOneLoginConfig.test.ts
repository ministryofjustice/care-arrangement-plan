import buildOneLoginConfig from './buildOneLoginConfig';

describe('buildOneLoginConfig', () => {
  it('leaves One Login disabled unless AUTH_PROVIDER is one-login', () => {
    expect(buildOneLoginConfig({ AUTH_PROVIDER: 'password' }, false)).toEqual({ enabled: false });
    expect(buildOneLoginConfig({}, false)).toEqual({ enabled: false });
  });

  it('uses the published simulator client when developing against localhost', () => {
    expect(
      buildOneLoginConfig(
        { AUTH_PROVIDER: 'one-login', PORT: '8001', ONE_LOGIN_PRIVATE_KEY: 'local-simulator-private-key' },
        false,
      ),
    ).toEqual({
      enabled: true,
      issuer: 'http://localhost:3000/',
      clientId: 'HGIOgho9HIRhgoepdIOPFdIUWgewi0jw',
      privateKey: 'local-simulator-private-key',
      redirectUrl: 'http://localhost:8001/oidc/authorization-code/callback',
      postLogoutRedirectUrl: 'http://localhost:8001/signed-out',
      scopes: ['openid', 'email'],
      vtr: 'Cl.Cm',
    });
  });

  it('requires a private key for the local simulator', () => {
    expect(() => buildOneLoginConfig({ AUTH_PROVIDER: 'one-login', PORT: '8001' }, false)).toThrow(
      'Missing env var ONE_LOGIN_PRIVATE_KEY',
    );
  });

  it('uses explicit settings when they are provided', () => {
    expect(
      buildOneLoginConfig(
        {
          AUTH_PROVIDER: 'one-login',
          ONE_LOGIN_ISSUER: 'https://oidc.integration.account.gov.uk',
          ONE_LOGIN_CLIENT_ID: 'integration-client',
          ONE_LOGIN_PRIVATE_KEY: 'integration-key',
          ONE_LOGIN_REDIRECT_URL: 'https://service.example/oidc/authorization-code/callback',
          ONE_LOGIN_POST_LOGOUT_REDIRECT_URL: 'https://service.example/signed-out',
          ONE_LOGIN_SCOPES: 'email',
          ONE_LOGIN_VTR: 'Cl.Cm.P2',
        },
        true,
      ),
    ).toMatchObject({
      enabled: true,
      issuer: 'https://oidc.integration.account.gov.uk/',
      clientId: 'integration-client',
      privateKey: 'integration-key',
      scopes: ['openid', 'email'],
      vtr: 'Cl.Cm.P2',
    });
  });

  it('refuses the simulator private key for a non-local issuer', () => {
    expect(() =>
      buildOneLoginConfig(
        {
          AUTH_PROVIDER: 'one-login',
          ONE_LOGIN_ISSUER: 'https://oidc.integration.account.gov.uk',
          ONE_LOGIN_CLIENT_ID: 'integration-client',
          ONE_LOGIN_REDIRECT_URL: 'https://service.example/callback',
          ONE_LOGIN_POST_LOGOUT_REDIRECT_URL: 'https://service.example/signed-out',
        },
        false,
      ),
    ).toThrow('Missing env var ONE_LOGIN_PRIVATE_KEY');
  });

  it('requires a private key in production even for a local issuer', () => {
    expect(() => buildOneLoginConfig({ AUTH_PROVIDER: 'one-login' }, true)).toThrow(
      'Missing env var ONE_LOGIN_CLIENT_ID',
    );
  });
});
