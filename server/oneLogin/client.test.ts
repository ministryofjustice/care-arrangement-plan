import crypto from 'crypto';

import config from '../config';
import { loggerMocks } from '../test-utils/testMocks';

import {
  buildAuthorizeUrl,
  buildLogoutUrl,
  clearDiscoveryCache,
  completeAuthorization,
  createAuthorizeRequest,
} from './client';
import OneLoginError from './error';
import { codeChallengeFor, JsonWebKeyWithKid } from './jwt';

const rsa = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const privateKey = rsa.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const issuerKeyId = crypto.randomBytes(8).toString('hex');
const clientId = crypto.randomBytes(16).toString('hex');
const accessToken = crypto.randomBytes(16).toString('hex');
const authorizationCode = crypto.randomBytes(16).toString('hex');
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const nonce = crypto.randomBytes(16).toString('base64url');
const state = crypto.randomBytes(16).toString('base64url');
const codeChallenge = crypto.randomBytes(32).toString('base64url');
const jwk = { ...rsa.publicKey.export({ format: 'jwk' }), alg: 'RS256', kid: issuerKeyId } as JsonWebKeyWithKid;
const issuer = 'https://issuer.example/';
const discovery = {
  issuer,
  authorization_endpoint: 'https://issuer.example/authorize',
  token_endpoint: 'https://issuer.example/token',
  userinfo_endpoint: 'https://issuer.example/userinfo',
  jwks_uri: 'https://issuer.example/jwks',
  end_session_endpoint: 'https://issuer.example/logout',
};

const originalOneLogin = config.oneLogin;
const fetchMock = jest.spyOn(global, 'fetch');

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const signIdToken = (claims: Record<string, unknown>) => {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: issuerKeyId })).toString('base64url');
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signature = crypto.sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), rsa.privateKey);
  return `${header}.${payload}.${signature.toString('base64url')}`;
};

const idToken = signIdToken({
  iss: issuer,
  aud: clientId,
  exp: Math.floor(Date.now() / 1000) + 300,
  iat: Math.floor(Date.now() / 1000),
  nonce,
  sub: 'user-1',
});

const enableOneLogin = () => {
  config.oneLogin = {
    enabled: true,
    issuer,
    clientId,
    privateKey,
    redirectUrl: 'http://localhost:3001/oidc/authorization-code/callback',
    postLogoutRedirectUrl: 'http://localhost:3001/signed-out',
    scopes: ['openid', 'email'],
    vtr: 'Cl.Cm',
  };
};

describe('One Login client', () => {
  beforeEach(() => {
    enableOneLogin();
    clearDiscoveryCache();
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url === 'https://issuer.example/.well-known/openid-configuration') return jsonResponse(200, discovery);
      if (url === discovery.jwks_uri) return jsonResponse(200, { keys: [jwk] });
      if (url === discovery.userinfo_endpoint) {
        return jsonResponse(200, { sub: 'user-1', email: 'person@example.com', email_verified: true });
      }
      if (url === discovery.token_endpoint) return jsonResponse(200, { access_token: accessToken, id_token: idToken });
      throw new Error(`Unexpected request ${url}`);
    });
  });

  afterEach(() => {
    config.oneLogin = originalOneLogin;
    clearDiscoveryCache();
  });

  afterAll(() => {
    fetchMock.mockRestore();
  });

  it('creates a PKCE authorize request and an authorize URL for the discovered issuer', async () => {
    const authorizeRequest = createAuthorizeRequest();
    const authorizeUrl = new URL(
      await buildAuthorizeUrl({
        nonce,
        state,
        codeChallenge: authorizeRequest.codeChallenge,
        locale: 'cy',
      }),
    );

    expect(authorizeRequest.codeChallenge).toBe(codeChallengeFor(authorizeRequest.codeVerifier));
    expect(authorizeUrl.origin).toBe('https://issuer.example');
    expect(authorizeUrl.searchParams.get('response_type')).toBe('code');
    expect(authorizeUrl.searchParams.get('client_id')).toBe(clientId);
    expect(authorizeUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3001/oidc/authorization-code/callback',
    );
    expect(authorizeUrl.searchParams.get('scope')).toBe('openid email');
    expect(authorizeUrl.searchParams.get('nonce')).toBe(nonce);
    expect(authorizeUrl.searchParams.get('state')).toBe(state);
    expect(authorizeUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(authorizeUrl.searchParams.get('vtr')).toBe('["Cl.Cm"]');
    expect(authorizeUrl.searchParams.get('ui_locales')).toBe('cy');
  });

  it('omits ui_locales unless the locale is English or Welsh', async () => {
    const authorizeUrl = new URL(await buildAuthorizeUrl({ nonce, state, codeChallenge, locale: 'fr' }));

    expect(authorizeUrl.searchParams.has('ui_locales')).toBe(false);
  });

  it('exchanges the code, checks the ID token, and reads the userinfo profile', async () => {
    const result = await completeAuthorization({ code: authorizationCode, codeVerifier, nonce });

    expect(result.user).toEqual({ sub: 'user-1', email: 'person@example.com', emailVerified: true });
    expect(result.idToken).toBe(idToken);

    const tokenCall = fetchMock.mock.calls.find((call) => String(call[0]) === discovery.token_endpoint);
    const body = new URLSearchParams(String((tokenCall?.[1] as RequestInit).body));
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code')).toBe(authorizationCode);
    expect(body.get('code_verifier')).toBe(codeVerifier);
    expect(body.get('client_assertion_type')).toBe('urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    expect(body.get('client_assertion')).toEqual(expect.any(String));
  });

  it('builds a logout URL on the issuer', async () => {
    const logoutUrl = new URL(await buildLogoutUrl(idToken));

    expect(logoutUrl.pathname).toBe('/logout');
    expect(logoutUrl.searchParams.get('id_token_hint')).toBe(idToken);
    expect(logoutUrl.searchParams.get('post_logout_redirect_uri')).toBe('http://localhost:3001/signed-out');
    expect(logoutUrl.searchParams.get('state')).toEqual(expect.any(String));
  });

  it('rejects discovery documents that do not belong to the configured issuer', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { ...discovery, authorization_endpoint: 'https://evil.example/authorize' }),
    );

    await expect(buildAuthorizeUrl({ nonce, state, codeChallenge })).rejects.toThrow(
      new OneLoginError('GOV.UK One Login discovery returned an unexpected endpoint', 502),
    );
  });

  it('rejects a token response without tokens and a userinfo subject that does not match', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/.well-known/openid-configuration')) return jsonResponse(200, discovery);
      if (url === discovery.token_endpoint) return jsonResponse(200, { error: 'invalid_grant' });
      throw new Error(`Unexpected request ${url}`);
    });

    await expect(completeAuthorization({ code: authorizationCode, codeVerifier, nonce })).rejects.toThrow(
      'GOV.UK One Login did not return tokens',
    );

    clearDiscoveryCache();
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/.well-known/openid-configuration')) return jsonResponse(200, discovery);
      if (url === discovery.token_endpoint) return jsonResponse(200, { access_token: accessToken, id_token: idToken });
      if (url === discovery.jwks_uri) return jsonResponse(200, { keys: [jwk] });
      return jsonResponse(200, { sub: 'someone-else' });
    });

    await expect(completeAuthorization({ code: authorizationCode, codeVerifier, nonce })).rejects.toThrow(
      'GOV.UK One Login userinfo subject did not match the ID token',
    );
  });

  it('reports the provider as unavailable when the request fails', async () => {
    fetchMock.mockRejectedValue(new Error('socket hang up'));

    await expect(buildLogoutUrl(idToken)).rejects.toMatchObject({
      message: 'GOV.UK One Login is unavailable',
      status: 502,
    });
    expect(loggerMocks.error).toHaveBeenCalled();
  });

  it('fails closed when GOV.UK One Login is disabled', async () => {
    config.oneLogin = { enabled: false };

    await expect(buildAuthorizeUrl({ nonce, state, codeChallenge })).rejects.toMatchObject({ status: 404 });
  });
});
