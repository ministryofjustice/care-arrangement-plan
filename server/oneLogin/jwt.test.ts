import crypto from 'crypto';

import { mockNow } from '../test-utils/testMocks';

import OneLoginError from './error';
import { codeChallengeFor, importPrivateKey, JsonWebKeyWithKid, signClientAssertion, verifyIdToken } from './jwt';

const nowSeconds = () => Math.floor(mockNow.getTime() / 1000);

const rsa = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const ec = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
const rsaPem = rsa.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const rsaJwk = { ...rsa.publicKey.export({ format: 'jwk' }), alg: 'RS256', kid: 'rsa-1' } as JsonWebKeyWithKid;
const ecJwk = { ...ec.publicKey.export({ format: 'jwk' }), alg: 'ES256', kid: 'ec-1' } as JsonWebKeyWithKid;

const claims = () => ({
  iss: 'https://issuer.example/',
  aud: 'client-id',
  exp: nowSeconds() + 300,
  iat: nowSeconds(),
  nonce: 'nonce-value',
  sub: 'user-1',
});

const signToken = (
  privateKey: crypto.KeyObject,
  tokenClaims: Record<string, unknown>,
  header: { alg: string; kid?: string },
) => {
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(tokenClaims)).toString('base64url');
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature =
    header.alg === 'ES256'
      ? crypto.sign('sha256', Buffer.from(signingInput), { key: privateKey, dsaEncoding: 'ieee-p1363' })
      : crypto.sign('RSA-SHA256', Buffer.from(signingInput), privateKey);

  return `${signingInput}.${signature.toString('base64url')}`;
};

const verify = (idToken: string, jwk: JsonWebKeyWithKid, nonce = 'nonce-value') =>
  verifyIdToken(idToken, {
    jwks: { keys: [jwk] },
    issuer: 'https://issuer.example/',
    audience: 'client-id',
    nonce,
  });

describe('One Login JWTs', () => {
  it('imports a PKCS8 private key from a PEM or a single line', () => {
    const body = rsaPem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');

    expect(importPrivateKey(rsaPem).export({ type: 'pkcs8', format: 'pem' })).toBe(rsaPem);
    expect(importPrivateKey(body).export({ type: 'pkcs8', format: 'pem' })).toBe(rsaPem);
    expect(importPrivateKey(rsaPem.replace(/\n/g, '\\n')).export({ type: 'pkcs8', format: 'pem' })).toBe(rsaPem);
  });

  it('builds an S256 code challenge and a private_key_jwt client assertion', () => {
    expect(codeChallengeFor('verifier')).toBe(crypto.createHash('sha256').update('verifier').digest('base64url'));

    const assertion = signClientAssertion(rsaPem, 'client-id', 'https://issuer.example/token');
    const [encodedHeader, encodedPayload, encodedSignature] = assertion.split('.');
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8')) as { alg: string; typ: string };
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
      iss: string;
      sub: string;
      aud: string;
      exp: number;
      iat: number;
    };

    expect(header).toEqual({ alg: 'RS256', typ: 'JWT' });
    expect(payload).toMatchObject({
      iss: 'client-id',
      sub: 'client-id',
      aud: 'https://issuer.example/token',
      iat: nowSeconds(),
      exp: nowSeconds() + 300,
    });
    expect(
      crypto.verify(
        'RSA-SHA256',
        Buffer.from(`${encodedHeader}.${encodedPayload}`),
        rsa.publicKey,
        Buffer.from(encodedSignature, 'base64url'),
      ),
    ).toBe(true);
  });

  it('accepts a signed RS256 or ES256 ID token', () => {
    const rsToken = signToken(rsa.privateKey, claims(), { alg: 'RS256', kid: 'rsa-1' });
    const esToken = signToken(
      ec.privateKey,
      { ...claims(), aud: ['client-id', 'other'] },
      { alg: 'ES256', kid: 'ec-1' },
    );

    expect(verify(rsToken, rsaJwk).sub).toBe('user-1');
    expect(verify(esToken, ecJwk).aud).toEqual(['client-id', 'other']);
  });

  it('rejects an ID token that fails a claim or signature check', () => {
    const token = signToken(rsa.privateKey, claims(), { alg: 'RS256', kid: 'rsa-1' });
    const otherKey = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).publicKey.export({ format: 'jwk' });

    expect(() => verify('a.b', rsaJwk)).toThrow(new OneLoginError('ID token is not a signed JWT'));
    expect(() => verify(token, { ...rsaJwk, kid: 'other' })).toThrow('ID token signature is invalid');
    expect(() => verify(token, { ...(otherKey as JsonWebKeyWithKid), kid: 'rsa-1', alg: 'RS256' })).toThrow(
      'ID token signature is invalid',
    );
    expect(() =>
      verify(
        signToken(rsa.privateKey, { ...claims(), iss: 'https://other.example/' }, { alg: 'RS256', kid: 'rsa-1' }),
        rsaJwk,
      ),
    ).toThrow('ID token issuer is invalid');
    expect(() =>
      verify(signToken(rsa.privateKey, { ...claims(), aud: 'other-client' }, { alg: 'RS256', kid: 'rsa-1' }), rsaJwk),
    ).toThrow('ID token audience is invalid');
    expect(() =>
      verify(
        signToken(rsa.privateKey, { ...claims(), exp: nowSeconds() - 61 }, { alg: 'RS256', kid: 'rsa-1' }),
        rsaJwk,
      ),
    ).toThrow('ID token has expired');
    expect(() =>
      verify(
        signToken(rsa.privateKey, { ...claims(), nbf: nowSeconds() + 61 }, { alg: 'RS256', kid: 'rsa-1' }),
        rsaJwk,
      ),
    ).toThrow('ID token is not valid yet');
    expect(() => verify(token, rsaJwk, 'other-nonce')).toThrow('ID token nonce is invalid');
    expect(() =>
      verify(signToken(rsa.privateKey, { ...claims(), sub: undefined }, { alg: 'RS256', kid: 'rsa-1' }), rsaJwk),
    ).toThrow('ID token subject is missing');
  });
});
