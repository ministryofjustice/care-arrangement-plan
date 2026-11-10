import { openOneLoginTransaction, sealOneLoginTransaction } from './transaction';

const secret = 'test-session-secret';
const transaction = {
  nonce: 'nonce-1',
  codeVerifier: 'verifier-1',
  returnUrl: '/make-a-plan',
};

describe('One Login transaction state', () => {
  it('round-trips the sign-in details without a session cookie', () => {
    const state = sealOneLoginTransaction(transaction, secret);

    expect(state).not.toContain('verifier-1');
    expect(openOneLoginTransaction(state, secret)).toEqual(transaction);
  });

  it('rejects a state value that has been changed', () => {
    const state = sealOneLoginTransaction(transaction, secret);
    const tampered = `${state.slice(0, -4)}aaaa`;

    expect(openOneLoginTransaction(tampered, secret)).toBeUndefined();
  });

  it('rejects a state value sealed with a different secret', () => {
    const state = sealOneLoginTransaction(transaction, secret);

    expect(openOneLoginTransaction(state, 'other-secret')).toBeUndefined();
  });

  it('rejects an expired sign-in', () => {
    const state = sealOneLoginTransaction(transaction, secret);
    jest.setSystemTime(Date.now() + 6 * 60 * 1000);

    expect(openOneLoginTransaction(state, secret)).toBeUndefined();
  });
});
