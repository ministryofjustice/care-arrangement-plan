import crypto from 'crypto';

import OneLoginError from './errors';
import { importPrivateKey, signClientAssertion, verifyIdToken } from './jwt';

const issuer = 'http://localhost:3000';
const audience = 'test-client';
const nonce = 'nonce-value';

const nowSeconds = () => Math.floor(Date.now() / 1000);

const signToken = (
  privateKey: crypto.KeyObject,
  payload: Record<string, unknown>,
  header: Record<string, unknown>,
  algorithm: 'RSA-SHA256' | 'sha256',
) => {
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.sign(
    algorithm,
    Buffer.from(signingInput),
    algorithm === 'sha256' ? { key: privateKey, dsaEncoding: 'ieee-p1363' } : privateKey,
  );
  return `${signingInput}.${signature.toString('base64url')}`;
};

const validPayload = () => ({
  iss: `${issuer}/`,
  aud: audience,
  exp: nowSeconds() + 300,
  iat: nowSeconds(),
  nonce,
  sub: 'user-1',
});

describe('One Login JWTs', () => {
  describe('RS256 ID tokens', () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const exported = publicKey.export({ format: 'jwk' });
    const jwk = { kty: exported.kty, n: exported.n, e: exported.e, kid: 'rsa-key', alg: 'RS256', use: 'sig' };

    const verify = (token: string) => verifyIdToken(token, { jwks: { keys: [jwk] }, issuer, audience, nonce });

    it('accepts a token signed by the published key', () => {
      const token = signToken(privateKey, validPayload(), { alg: 'RS256', typ: 'JWT', kid: 'rsa-key' }, 'RSA-SHA256');

      expect(verify(token).sub).toBe('user-1');
    });

    it('rejects a token with a different nonce', () => {
      const token = signToken(
        privateKey,
        { ...validPayload(), nonce: 'other' },
        { alg: 'RS256', typ: 'JWT', kid: 'rsa-key' },
        'RSA-SHA256',
      );

      expect(() => verify(token)).toThrow(OneLoginError);
      expect(() => verify(token)).toThrow('ID token nonce is invalid');
    });

    it('rejects a token signed by a different key', () => {
      const otherKey = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
      const token = signToken(otherKey, validPayload(), { alg: 'RS256', typ: 'JWT', kid: 'rsa-key' }, 'RSA-SHA256');

      expect(() => verify(token)).toThrow('ID token signature is invalid');
    });
  });

  describe('ES256 ID tokens', () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    const exported = publicKey.export({ format: 'jwk' });
    const jwk = {
      kty: exported.kty,
      crv: exported.crv,
      x: exported.x,
      y: exported.y,
      kid: 'ec-key',
      alg: 'ES256',
      use: 'sig',
    };

    it('accepts an ES256 token, which is the simulator default', () => {
      const token = signToken(privateKey, validPayload(), { alg: 'ES256', typ: 'JWT', kid: 'ec-key' }, 'sha256');
      const claims = verifyIdToken(token, { jwks: { keys: [jwk] }, issuer, audience, nonce });

      expect(claims.sub).toBe('user-1');
    });
  });

  it('signs a private_key_jwt client assertion for the token endpoint', () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const pkcs8 = privateKey.export({ format: 'der', type: 'pkcs8' }) as Buffer;
    const assertion = signClientAssertion(pkcs8.toString('base64'), audience, `${issuer}/token`);
    const [encodedHeader, encodedPayload, encodedSignature] = assertion.split('.');
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = Buffer.from(encodedSignature, 'base64url');

    expect(JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))).toMatchObject({
      iss: audience,
      sub: audience,
      aud: `${issuer}/token`,
    });
    expect(crypto.verify('RSA-SHA256', Buffer.from(signingInput), publicKey, signature)).toBe(true);
    expect(importPrivateKey(pkcs8.toString('base64')).asymmetricKeyType).toBe('rsa');
  });
});
