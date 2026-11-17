import crypto from 'crypto';

// OWASP password storage: scrypt with N=2^17, r=8, p=1.
const SCRYPT_N = 131072;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SALT_BYTES = 16;
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = {
  N: SCRYPT_N,
  r: SCRYPT_R,
  p: SCRYPT_P,
  maxmem: 256 * 1024 * 1024,
} as const;

const acceptedCookies = new Set<string>();

const deriveKey = (password: string, salt: Buffer) => crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);

const encryptPassword = (password: string) => {
  const salt = crypto.randomBytes(SALT_BYTES);
  const hash = deriveKey(password, salt);
  return `${salt.toString('hex')}.${hash.toString('hex')}`;
};

const isHex = (value: string, expectedLength: number) =>
  value.length === expectedLength && /^[0-9a-f]+$/i.test(value);

const passwordMatchesHash = (password: string, encoded: string) => {
  const [saltHex, hashHex] = encoded.split('.');
  if (!saltHex || !hashHex || encoded.split('.').length !== 2) {
    return false;
  }
  if (!isHex(saltHex, SALT_BYTES * 2) || !isHex(hashHex, KEY_LENGTH * 2)) {
    return false;
  }

  const actual = deriveKey(password, Buffer.from(saltHex, 'hex'));
  return crypto.timingSafeEqual(actual, Buffer.from(hashHex, 'hex'));
};

export const authenticationCookieMatches = (encoded: string | undefined, passwords: string[]) => {
  if (!encoded) {
    return false;
  }

  const cacheKey = `${passwords.join('\0')}\n${encoded}`;
  if (acceptedCookies.has(cacheKey)) {
    return true;
  }

  const matches = passwords.some((password) => passwordMatchesHash(password, encoded));
  if (matches) {
    acceptedCookies.add(cacheKey);
  }
  return matches;
};

export default encryptPassword;
