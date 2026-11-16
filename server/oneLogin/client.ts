import config from '../config';
import logger from '../logging/logger';

import OneLoginError from './errors';
import { codeChallengeFor, JsonWebKeyWithKid, randomUrlSafe, signClientAssertion, verifyIdToken } from './jwt';

export type OneLoginUser = {
  sub: string;
  email?: string;
  emailVerified?: boolean;
};

type DiscoveryDocument = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  end_session_endpoint: string;
};

type TokenResponse = {
  access_token?: string;
  id_token?: string;
  error?: string;
};

const REQUEST_TIMEOUT_MS = 10_000;

let discoveryCache: { issuer: string; document: DiscoveryDocument } | undefined;

const enabledSettings = () => {
  if (!config.oneLogin.enabled) {
    throw new OneLoginError('GOV.UK One Login is not enabled', 404);
  }
  return config.oneLogin;
};

const canonicalIssuer = (value: string) => value.replace(/\/$/, '');

const assertSameOrigin = (endpoint: string, issuer: string) => {
  let endpointUrl: URL;
  try {
    endpointUrl = new URL(endpoint);
  } catch {
    throw new OneLoginError('GOV.UK One Login discovery returned an invalid endpoint', 502);
  }

  if (endpointUrl.origin !== new URL(issuer).origin) {
    throw new OneLoginError('GOV.UK One Login discovery returned an unexpected endpoint', 502);
  }
};

const readJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new OneLoginError('GOV.UK One Login is unavailable', 502);
  }
  return (await response.json()) as T;
};

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    return await readJson<T>(response);
  } catch (error) {
    if (error instanceof OneLoginError) {
      throw error;
    }
    logger.error(error, 'GOV.UK One Login request failed');
    throw new OneLoginError('GOV.UK One Login is unavailable', 502, { cause: error });
  }
};

const requireEndpoint = (document: DiscoveryDocument, field: keyof DiscoveryDocument) => {
  const endpoint = document[field];
  if (!endpoint) {
    throw new OneLoginError('GOV.UK One Login discovery response is incomplete', 502);
  }
  assertSameOrigin(endpoint, document.issuer);
  return endpoint;
};

export const clearDiscoveryCache = () => {
  discoveryCache = undefined;
};

const getDiscovery = async () => {
  const settings = enabledSettings();
  if (discoveryCache?.issuer === settings.issuer) {
    return discoveryCache.document;
  }

  const discoveryUrl = new URL('.well-known/openid-configuration', settings.issuer);
  const document = await fetchJson<DiscoveryDocument>(discoveryUrl.toString(), {
    headers: { accept: 'application/json' },
  });

  if (!document.issuer || canonicalIssuer(document.issuer) !== canonicalIssuer(settings.issuer)) {
    throw new OneLoginError('GOV.UK One Login issuer did not match configuration', 502);
  }

  requireEndpoint(document, 'authorization_endpoint');
  requireEndpoint(document, 'token_endpoint');
  requireEndpoint(document, 'userinfo_endpoint');
  requireEndpoint(document, 'jwks_uri');
  requireEndpoint(document, 'end_session_endpoint');

  discoveryCache = { issuer: settings.issuer, document };
  return document;
};

export const createAuthorizeRequest = () => {
  const codeVerifier = randomUrlSafe();
  return {
    nonce: randomUrlSafe(),
    state: randomUrlSafe(),
    codeVerifier,
    codeChallenge: codeChallengeFor(codeVerifier),
  };
};

export const buildAuthorizeUrl = async (request: {
  nonce: string;
  state: string;
  codeChallenge: string;
  locale?: string;
}) => {
  const settings = enabledSettings();
  const discovery = await getDiscovery();
  const url = new URL(discovery.authorization_endpoint);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', settings.clientId);
  url.searchParams.set('redirect_uri', settings.redirectUrl);
  url.searchParams.set('scope', settings.scopes.join(' '));
  url.searchParams.set('nonce', request.nonce);
  url.searchParams.set('state', request.state);
  url.searchParams.set('code_challenge', request.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('vtr', JSON.stringify([settings.vtr]));

  if (request.locale === 'en' || request.locale === 'cy') {
    url.searchParams.set('ui_locales', request.locale);
  }

  return url.toString();
};

const exchangeCode = async (code: string, codeVerifier: string) => {
  const settings = enabledSettings();
  const discovery = await getDiscovery();
  const assertion = signClientAssertion(settings.privateKey, settings.clientId, discovery.token_endpoint);
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: settings.redirectUrl,
    client_id: settings.clientId,
    code_verifier: codeVerifier,
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    client_assertion: assertion,
  });

  const tokens = await fetchJson<TokenResponse>(discovery.token_endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body,
  });

  if (!tokens.access_token || !tokens.id_token || tokens.error) {
    throw new OneLoginError('GOV.UK One Login did not return tokens', 502);
  }

  return tokens;
};

export const completeAuthorization = async (request: { code: string; codeVerifier: string; nonce: string }) => {
  const settings = enabledSettings();
  const discovery = await getDiscovery();
  const tokens = await exchangeCode(request.code, request.codeVerifier);
  const jwks = await fetchJson<{ keys: JsonWebKeyWithKid[] }>(discovery.jwks_uri, {
    headers: { accept: 'application/json' },
  });
  const claims = verifyIdToken(tokens.id_token, {
    jwks,
    issuer: discovery.issuer,
    audience: settings.clientId,
    nonce: request.nonce,
  });
  const userinfo = await fetchJson<Record<string, unknown>>(discovery.userinfo_endpoint, {
    headers: { authorization: `Bearer ${tokens.access_token}`, accept: 'application/json' },
  });

  if (userinfo.sub !== claims.sub) {
    throw new OneLoginError('GOV.UK One Login userinfo subject did not match the ID token');
  }

  const user: OneLoginUser = { sub: claims.sub };
  if (typeof userinfo.email === 'string') {
    user.email = userinfo.email;
  }
  if (userinfo.email_verified === true) {
    user.emailVerified = true;
  }

  return { idToken: tokens.id_token, user };
};

export const buildLogoutUrl = async (idToken: string) => {
  const settings = enabledSettings();
  const discovery = await getDiscovery();
  const url = new URL(discovery.end_session_endpoint);
  url.searchParams.set('id_token_hint', idToken);
  url.searchParams.set('post_logout_redirect_uri', settings.postLogoutRedirectUrl);
  url.searchParams.set('state', randomUrlSafe());
  return url.toString();
};
