import crypto from 'crypto';

const TOKEN_LIFETIME_MS = 5 * 60 * 1000;

export type OneLoginTransaction = {
  nonce: string;
  codeVerifier: string;
  returnUrl: string;
};

const encryptionKey = (secret: string) => crypto.createHash('sha256').update(secret).digest();

export const sealOneLoginTransaction = (transaction: OneLoginTransaction, secret: string) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(secret), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify({ ...transaction, exp: Date.now() + TOKEN_LIFETIME_MS })),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64url');
};

export const openOneLoginTransaction = (state: string, secret: string): OneLoginTransaction | undefined => {
  try {
    const payload = Buffer.from(state, 'base64url');
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const ciphertext = payload.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(secret), iv);
    decipher.setAuthTag(tag);
    const parsed = JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')) as {
      nonce?: string;
      codeVerifier?: string;
      returnUrl?: string;
      exp?: number;
    };

    if (!parsed.nonce || !parsed.codeVerifier || !parsed.returnUrl || typeof parsed.exp !== 'number') {
      return undefined;
    }
    if (parsed.exp < Date.now()) {
      return undefined;
    }

    return { nonce: parsed.nonce, codeVerifier: parsed.codeVerifier, returnUrl: parsed.returnUrl };
  } catch {
    return undefined;
  }
};
