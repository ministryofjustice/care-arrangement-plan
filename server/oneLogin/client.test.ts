import crypto from 'crypto';

import config from '../config';

import {
  buildAuthorizeUrl,
  buildLogoutUrl,
  clearDiscoveryCache,
  completeAuthorization,
  createAuthorizeRequest,
} from './client';

const issuer = 'http://localhost:3000/';
const clientId = 'test-client';
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const exportedPublicKey = publicKey.export({ format: 'jwk' });
const publicJwk = {
  kty: exportedPublicKey.kty,
  n: exportedPublicKey.n,
  e: exportedPublicKey.e,
  kid: 'test-key',
  alg: 'RS256',
  use: 'sig',
};

const discovery = {
  issuer,
  authorization_endpoint: `${issuer}authorize`,
  token_endpoint: `${issuer}token`,
  userinfo_endpoint: `${issuer}userinfo`,
  jwks_uri: `${issuer}.well-known/jwks.json`,
  end_session_endpoint: `${issuer}logout`,
};

const signIdToken = (payload: Record<string, unknown>) => {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'test-key' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${header}.${body}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), privateKey).toString('base64url');
  return `${signingInput}.${signature}`;
};

const idTokenClaims = (nonce: string) => ({
  iss: issuer,
  aud: clientId,
  exp: Math.floor(Date.now() / 1000) + 300,
  iat: Math.floor(Date.now() / 1000),
  nonce,
  sub: 'user-1',
});

describe('One Login client', () => {
  const originalOneLogin = config.oneLogin;
  let fetchMock: jest.SpiedFunction<typeof fetch>;
  let tokenRequestBody = '';

  beforeEach(() => {
    clearDiscoveryCache();
    tokenRequestBody = '';
    const pkcs8 = privateKey.export({ format: 'der', type: 'pkcs8' }) as Buffer;
    config.oneLogin = {
      enabled: true,
      issuer,
      clientId,
      privateKey: pkcs8.toString('base64'),
      redirectUrl: 'http://localhost:8001/oidc/authorization-code/callback',
      postLogoutRedirectUrl: 'http://localhost:8001/signed-out',
      scopes: ['openid', 'email'],
      vtr: 'Cl.Cm',
    };

    fetchMock = jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = input.toString();
      if (url.endsWith('/.well-known/openid-configuration')) {
        return Response.json(discovery);
      }
      if (url.endsWith('/.well-known/jwks.json')) {
        return Response.json({ keys: [publicJwk] });
      }
      if (url.endsWith('/token')) {
        tokenRequestBody = init?.body?.toString() ?? '';
        const nonce = 'nonce-from-request';
        return Response.json({
          access_token: 'access-token',
          id_token: signIdToken({ ...idTokenClaims(nonce), nonce: currentNonce }),
          token_type: 'Bearer',
        });
      }
      if (url.endsWith('/userinfo')) {
        return Response.json({ sub: 'user-1', email: 'test@example.com', email_verified: true });
      }
      throw new Error(`Unexpected request to ${url}`);
    });
  });

  afterEach(() => {
    config.oneLogin = originalOneLogin;
    fetchMock.mockRestore();
    clearDiscoveryCache();
  });

  let currentNonce = 'nonce-from-request';

  it('builds an authorize request the simulator can accept', async () => {
    const authorizeRequest = createAuthorizeRequest();
    const authorizeUrl = new URL(await buildAuthorizeUrl({ ...authorizeRequest, locale: 'cy' }));

    expect(authorizeUrl.origin).toBe('http://localhost:3000');
    expect(authorizeUrl.pathname).toBe('/authorize');
    expect(authorizeUrl.searchParams.get('response_type')).toBe('code');
    expect(authorizeUrl.searchParams.get('client_id')).toBe(clientId);
    expect(authorizeUrl.searchParams.get('scope')).toBe('openid email');
    expect(authorizeUrl.searchParams.get('nonce')).toBe(authorizeRequest.nonce);
    expect(authorizeUrl.searchParams.get('state')).toBe(authorizeRequest.state);
    expect(authorizeUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(authorizeUrl.searchParams.get('vtr')).toBe('["Cl.Cm"]');
    expect(authorizeUrl.searchParams.get('ui_locales')).toBe('cy');
    expect(authorizeUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:8001/oidc/authorization-code/callback',
    );
  });

  it('exchanges the authorization code and returns the simulator user', async () => {
    currentNonce = 'nonce-from-request';
    const result = await completeAuthorization({
      code: 'auth-code',
      codeVerifier: 'verifier',
      nonce: currentNonce,
    });

    const tokenRequest = new URLSearchParams(tokenRequestBody);
    const assertion = tokenRequest.get('client_assertion') ?? '';
    const [encodedHeader, encodedPayload, encodedSignature] = assertion.split('.');
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    expect(tokenRequest.get('grant_type')).toBe('authorization_code');
    expect(tokenRequest.get('code')).toBe('auth-code');
    expect(tokenRequest.get('code_verifier')).toBe('verifier');
    expect(tokenRequest.get('client_assertion_type')).toBe('urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    expect(JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')).aud).toBe(`${issuer}token`);
    expect(
      crypto.verify('RSA-SHA256', Buffer.from(signingInput), publicKey, Buffer.from(encodedSignature, 'base64url')),
    ).toBe(true);
    expect(result.user).toEqual({ sub: 'user-1', email: 'test@example.com', emailVerified: true });
  });

  it('rejects an ID token nonce that does not match the authorize request', async () => {
    currentNonce = 'different-nonce';

    await expect(
      completeAuthorization({ code: 'auth-code', codeVerifier: 'verifier', nonce: 'nonce-from-request' }),
    ).rejects.toThrow('ID token nonce is invalid');
  });

  it('rejects userinfo for a different subject', async () => {
    currentNonce = 'nonce-from-request';
    fetchMock.mockImplementation(async (input) => {
      const url = input.toString();
      if (url.endsWith('/.well-known/openid-configuration')) {
        return Response.json(discovery);
      }
      if (url.endsWith('/token')) {
        return Response.json({
          access_token: 'access-token',
          id_token: signIdToken(idTokenClaims('nonce-from-request')),
          token_type: 'Bearer',
        });
      }
      if (url.endsWith('/.well-known/jwks.json')) {
        return Response.json({ keys: [publicJwk] });
      }
      if (url.endsWith('/userinfo')) {
        return Response.json({ sub: 'someone-else', email: 'other@example.com' });
      }
      return Response.json({}, { status: 404 });
    });

    await expect(
      completeAuthorization({ code: 'auth-code', codeVerifier: 'verifier', nonce: 'nonce-from-request' }),
    ).rejects.toThrow('GOV.UK One Login userinfo subject did not match the ID token');
  });

  it('rejects discovery documents that point at another host', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        ...discovery,
        token_endpoint: 'https://evil.example/token',
      }),
    );

    await expect(buildLogoutUrl('id-token')).rejects.toThrow(
      'GOV.UK One Login discovery returned an unexpected endpoint',
    );
  });

  it('builds a logout URL back to the signed-out page', async () => {
    const logoutUrl = new URL(await buildLogoutUrl('signed-id-token'));

    expect(logoutUrl.pathname).toBe('/logout');
    expect(logoutUrl.searchParams.get('id_token_hint')).toBe('signed-id-token');
    expect(logoutUrl.searchParams.get('post_logout_redirect_uri')).toBe('http://localhost:8001/signed-out');
  });
});
