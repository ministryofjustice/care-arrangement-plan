import crypto from 'crypto';

import OneLoginError from './errors';

const CLOCK_SKEW_SECONDS = 60;

type JwtHeader = {
  alg?: string;
  kid?: string;
};

export type IdTokenClaims = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  nbf?: number;
  nonce?: string;
  sub?: string;
};

export type JsonWebKeyWithKid = {
  alg?: string;
  crv?: string;
  e?: string;
  kid?: string;
  kty?: string;
  n?: string;
  use?: string;
  x?: string;
  y?: string;
};

const encode = (value: string) => Buffer.from(value).toString('base64url');

const decodeJson = <T>(segment: string): T => {
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;
  } catch {
    throw new OneLoginError('ID token is not a signed JWT');
  }
};

export const importPrivateKey = (value: string): crypto.KeyObject => {
  const normalised = value.replace(/\\n/g, '\n').trim();
  if (normalised.includes('BEGIN')) {
    return crypto.createPrivateKey(normalised);
  }

  const body = normalised.replace(/\s+/g, '');
  const lines = body.match(/.{1,64}/g) ?? [];
  return crypto.createPrivateKey(`-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`);
};

export const randomUrlSafe = () => crypto.randomBytes(32).toString('base64url');

export const codeChallengeFor = (verifier: string) => crypto.createHash('sha256').update(verifier).digest('base64url');

export const signClientAssertion = (privateKeyValue: string, clientId: string, audience: string) => {
  const header = encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = encode(
    JSON.stringify({
      iss: clientId,
      sub: clientId,
      aud: audience,
      jti: crypto.randomUUID(),
      iat: issuedAt,
      exp: issuedAt + 300,
    }),
  );
  const signingInput = `${header}.${payload}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), importPrivateKey(privateKeyValue));
  return `${signingInput}.${signature.toString('base64url')}`;
};

const canonicalIssuer = (value: string) => value.replace(/\/$/, '');

const selectJwk = (keys: JsonWebKeyWithKid[], kid?: string) => {
  if (kid) {
    return keys.find((key) => key.kid === kid);
  }
  return keys.length === 1 ? keys[0] : undefined;
};

const verifySignature = (alg: string, signingInput: string, signature: Buffer, jwk: JsonWebKeyWithKid) => {
  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' } as crypto.JsonWebKeyInput);

  if (alg === 'RS256') {
    return crypto.verify('RSA-SHA256', Buffer.from(signingInput), publicKey, signature);
  }

  if (alg === 'ES256') {
    return crypto.verify('sha256', Buffer.from(signingInput), { key: publicKey, dsaEncoding: 'ieee-p1363' }, signature);
  }

  return false;
};

export const verifyIdToken = (
  idToken: string,
  options: { jwks: { keys: JsonWebKeyWithKid[] }; issuer: string; audience: string; nonce: string },
): IdTokenClaims => {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new OneLoginError('ID token is not a signed JWT');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJson<JwtHeader>(encodedHeader);
  const claims = decodeJson<IdTokenClaims>(encodedPayload);
  const jwk = selectJwk(options.jwks.keys, header.kid);

  if (!header.alg || !jwk) {
    throw new OneLoginError('ID token signature is invalid');
  }

  const signature = Buffer.from(encodedSignature, 'base64url');
  const valid = verifySignature(header.alg, `${encodedHeader}.${encodedPayload}`, signature, jwk);
  if (!valid) {
    throw new OneLoginError('ID token signature is invalid');
  }

  if (!claims.iss || canonicalIssuer(claims.iss) !== canonicalIssuer(options.issuer)) {
    throw new OneLoginError('ID token issuer is invalid');
  }

  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(options.audience)) {
    throw new OneLoginError('ID token audience is invalid');
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== 'number' || claims.exp + CLOCK_SKEW_SECONDS < now) {
    throw new OneLoginError('ID token has expired');
  }
  if (typeof claims.nbf === 'number' && claims.nbf - CLOCK_SKEW_SECONDS > now) {
    throw new OneLoginError('ID token is not valid yet');
  }
  if (claims.nonce !== options.nonce) {
    throw new OneLoginError('ID token nonce is invalid');
  }
  if (!claims.sub) {
    throw new OneLoginError('ID token subject is missing');
  }

  return claims;
};
