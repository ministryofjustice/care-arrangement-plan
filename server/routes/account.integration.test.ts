import crypto from 'crypto';
import http from 'http';

import request from 'supertest';

import config from '../config';
import paths from '../constants/paths';
import { clearDiscoveryCache } from '../oneLogin/client';
import { JsonWebKeyWithKid } from '../oneLogin/jwt';
import testAppSetup from '../test-utils/testAppSetup';
import { sessionMock } from '../test-utils/testMocks';

const app = testAppSetup();
const clientKeys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const issuerKeys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const clientPrivateKey = clientKeys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const issuerJwk = {
  ...issuerKeys.publicKey.export({ format: 'jwk' }),
  alg: 'RS256',
  kid: 'issuer-key',
} as JsonWebKeyWithKid;
const originalOneLogin = config.oneLogin;
const originalUseAuth = config.useAuth;

type IssuedLogin = {
  nonce: string;
  codeChallenge: string;
  idToken?: string;
};

let issuer: http.Server;
let issuerOrigin = '';
let tokenRequest: URLSearchParams | undefined;
let issuedLogin: IssuedLogin | undefined;
let discoveryMode: 'ok' | 'down' | 'foreign-endpoint' = 'ok';

const signIdToken = (claims: Record<string, unknown>) => {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'issuer-key' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signature = crypto.sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), issuerKeys.privateKey);
  return `${header}.${payload}.${signature.toString('base64url')}`;
};

const readBody = (incoming: http.IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    incoming.on('data', (chunk: Buffer) => chunks.push(chunk));
    incoming.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    incoming.on('error', reject);
  });

const sendJson = (response: http.ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
};

const startIssuer = () =>
  new Promise<void>((resolve) => {
    issuer = http.createServer(async (incoming, response) => {
      const url = new URL(incoming.url || '/', issuerOrigin);
      if (url.pathname === '/.well-known/openid-configuration') {
        if (discoveryMode === 'down') {
          sendJson(response, 503, {});
          return;
        }
        sendJson(response, 200, {
          issuer: issuerOrigin,
          authorization_endpoint:
            discoveryMode === 'foreign-endpoint' ? 'https://evil.example/authorize' : `${issuerOrigin}/authorize`,
          token_endpoint: `${issuerOrigin}/token`,
          userinfo_endpoint: `${issuerOrigin}/userinfo`,
          jwks_uri: `${issuerOrigin}/jwks`,
          end_session_endpoint: `${issuerOrigin}/logout`,
        });
        return;
      }
      if (url.pathname === '/jwks') {
        sendJson(response, 200, { keys: [issuerJwk] });
        return;
      }
      if (url.pathname === '/token' && incoming.method === 'POST') {
        tokenRequest = new URLSearchParams(await readBody(incoming));
        const verifier = tokenRequest.get('code_verifier') || '';
        const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
        if (!issuedLogin || challenge !== issuedLogin.codeChallenge || tokenRequest.get('code') !== 'auth-code') {
          sendJson(response, 400, { error: 'invalid_grant' });
          return;
        }
        issuedLogin.idToken = signIdToken({
          iss: issuerOrigin,
          aud: 'integration-client',
          exp: Math.floor(Date.now() / 1000) + 300,
          iat: Math.floor(Date.now() / 1000),
          nonce: issuedLogin.nonce,
          sub: 'user-1',
        });
        sendJson(response, 200, { access_token: 'access-token', id_token: issuedLogin.idToken });
        return;
      }
      if (url.pathname === '/userinfo') {
        const subject = incoming.headers.authorization === 'Bearer access-token' ? 'user-1' : 'someone-else';
        sendJson(response, 200, { sub: subject, email: 'person@example.com', email_verified: true });
        return;
      }
      response.writeHead(404);
      response.end();
    });
    issuer.listen(0, '127.0.0.1', () => {
      const address = issuer.address();
      if (!address || typeof address === 'string') {
        throw new Error('Test issuer did not bind to a port');
      }
      issuerOrigin = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });

const enableOneLogin = () => {
  config.useAuth = true;
  config.oneLogin = {
    enabled: true,
    issuer: `${issuerOrigin}/`,
    clientId: 'integration-client',
    privateKey: clientPrivateKey,
    redirectUrl: 'http://localhost:3001/oidc/authorization-code/callback',
    postLogoutRedirectUrl: 'http://localhost:3001/signed-out',
    scopes: ['openid', 'email'],
    vtr: 'Cl.Cm',
  };
};

describe('GOV.UK One Login routes', () => {
  beforeAll(async () => {
    await startIssuer();
  });

  afterAll(async () => {
    config.oneLogin = originalOneLogin;
    config.useAuth = originalUseAuth;
    clearDiscoveryCache();
    await new Promise<void>((resolve, reject) => issuer.close((error) => (error ? reject(error) : resolve())));
  });

  beforeEach(() => {
    jest.useRealTimers();
    discoveryMode = 'ok';
    tokenRequest = undefined;
    issuedLogin = undefined;
    clearDiscoveryCache();
    enableOneLogin();
    sessionMock.regenerate = (callback) => {
      callback(null);
      return sessionMock;
    };
    sessionMock.lang = 'en';
  });

  it('sends a protected page to sign-in and returns the user to that page after the callback', async () => {
    await request(app).get(paths.TASK_LIST).expect(302).expect('location', paths.SIGN_IN);

    const signIn = await request(app).get(paths.SIGN_IN).expect(302);
    const authorizeUrl = new URL(signIn.headers.location || '');
    issuedLogin = {
      nonce: authorizeUrl.searchParams.get('nonce') || '',
      codeChallenge: authorizeUrl.searchParams.get('code_challenge') || '',
    };

    expect(authorizeUrl.origin).toBe(issuerOrigin);
    expect(authorizeUrl.pathname).toBe('/authorize');
    expect(authorizeUrl.searchParams.get('client_id')).toBe('integration-client');
    expect(authorizeUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3001/oidc/authorization-code/callback',
    );
    expect(authorizeUrl.searchParams.get('ui_locales')).toBe('en');

    const callback = await request(app)
      .get(paths.ONE_LOGIN_CALLBACK)
      .query({ code: 'auth-code', state: authorizeUrl.searchParams.get('state') })
      .expect(302);

    expect(callback.headers.location).toBe(paths.TASK_LIST);
    expect(sessionMock.oneLogin).toEqual({
      sub: 'user-1',
      email: 'person@example.com',
      emailVerified: true,
      idToken: issuedLogin.idToken,
    });
    expect(tokenRequest?.get('client_id')).toBe('integration-client');
    expect(tokenRequest?.get('redirect_uri')).toBe('http://localhost:3001/oidc/authorization-code/callback');

    const assertion = tokenRequest?.get('client_assertion') || '';
    const [encodedHeader, encodedPayload, encodedSignature] = assertion.split('.');
    expect(
      crypto.verify(
        'RSA-SHA256',
        Buffer.from(`${encodedHeader}.${encodedPayload}`),
        clientKeys.publicKey,
        Buffer.from(encodedSignature, 'base64url'),
      ),
    ).toBe(true);
  });

  it('keeps an external return URL inside the service', async () => {
    const signIn = await request(app).get(paths.SIGN_IN).query({ returnURL: 'https://evil.example/phish' }).expect(302);
    const authorizeUrl = new URL(signIn.headers.location || '');
    issuedLogin = {
      nonce: authorizeUrl.searchParams.get('nonce') || '',
      codeChallenge: authorizeUrl.searchParams.get('code_challenge') || '',
    };

    await request(app)
      .get(paths.ONE_LOGIN_CALLBACK)
      .query({ code: 'auth-code', state: authorizeUrl.searchParams.get('state') })
      .expect(302)
      .expect('location', paths.START);
  });

  it('shows a problem page when the provider or the callback is rejected', async () => {
    const providerError = await request(app)
      .get(paths.ONE_LOGIN_CALLBACK)
      .query({ error: 'access_denied', state: 'state', code: 'auth-code' })
      .expect(400);
    expect(providerError.text).toContain('Sorry, there is a problem with GOV.UK One Login');

    const invalidCallback = await request(app).get(paths.ONE_LOGIN_CALLBACK).query({ code: 'auth-code' }).expect(400);
    expect(invalidCallback.text).toContain('You can try signing in again.');
  });

  it('shows a problem page when discovery returns an endpoint on another origin', async () => {
    discoveryMode = 'foreign-endpoint';

    const response = await request(app).get(paths.SIGN_IN).expect(502);

    expect(response.text).toContain('Sorry, there is a problem with GOV.UK One Login');
  });

  it('shows a problem page when the provider is unavailable', async () => {
    discoveryMode = 'down';

    await request(app).get(paths.SIGN_IN).expect(502);
  });

  it('signs the user out through the issuer and can show the signed-out page', async () => {
    sessionMock.oneLogin = {
      sub: 'user-1',
      idToken: 'header.payload.signature',
    };

    const signOut = await request(app).get(paths.SIGN_OUT).expect(302);
    const logoutUrl = new URL(signOut.headers.location || '');

    expect(logoutUrl.origin).toBe(issuerOrigin);
    expect(logoutUrl.pathname).toBe('/logout');
    expect(logoutUrl.searchParams.get('id_token_hint')).toBe('header.payload.signature');
    expect(logoutUrl.searchParams.get('post_logout_redirect_uri')).toBe('http://localhost:3001/signed-out');

    delete sessionMock.oneLogin;
    await request(app).get(paths.SIGN_OUT).expect(302).expect('location', paths.SIGNED_OUT);

    const signedOut = await request(app).get(paths.SIGNED_OUT).expect(200);
    expect(signedOut.text).toContain('You have signed out');
    expect(signedOut.text).toContain('Start again');
  });
});
