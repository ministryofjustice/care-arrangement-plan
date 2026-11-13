import { mockNow } from '../test-utils/testMocks';

import { openOneLoginTransaction, sealOneLoginTransaction } from './transaction';

const SECRET = 'session-secret';
const transaction = {
  nonce: 'nonce-value',
  codeVerifier: 'verifier-value',
  returnUrl: '/make-a-plan',
};

describe('One Login transaction state', () => {
  it('seals a transaction so it can be opened with the same secret', () => {
    const state = sealOneLoginTransaction(transaction, SECRET);

    expect(state).not.toContain(transaction.nonce);
    expect(openOneLoginTransaction(state, SECRET)).toEqual(transaction);
  });

  it('rejects a different secret, a changed payload, and an expired transaction', () => {
    const state = sealOneLoginTransaction(transaction, SECRET);

    expect(openOneLoginTransaction(state, 'other-secret')).toBeUndefined();
    expect(openOneLoginTransaction(`${state.slice(0, -1)}${state.endsWith('a') ? 'b' : 'a'}`, SECRET)).toBeUndefined();
    expect(openOneLoginTransaction('not-a-token', SECRET)).toBeUndefined();

    jest.setSystemTime(mockNow.getTime() + 5 * 60 * 1000 + 1);
    expect(openOneLoginTransaction(state, SECRET)).toBeUndefined();
  });
});
