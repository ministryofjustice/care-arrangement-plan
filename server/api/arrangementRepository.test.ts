import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import ArrangementRepository, { Arrangement } from './arrangementRepository';
import dynamoClient from './dynamoClient';

jest.mock('./dynamoClient');

describe('ArrangementRepository', () => {
  const mockedSend = jest.mocked(dynamoClient.send);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets an arrangement', async () => {
    const repository = new ArrangementRepository();

    await repository.getArrangement('user-123', 'arrangement-456');

    expect(mockedSend).toHaveBeenCalledWith(expect.any(GetCommand));
  });

  it('creates an arrangement', async () => {
    const repository = new ArrangementRepository();

    const arrangement: Arrangement = {
      arrangementId: 'arrangement-456',
      userId: 'user-123',
      ttl: 1234567890,
    };

    await repository.createArrangement(arrangement);

    expect(mockedSend).toHaveBeenCalledWith(expect.any(PutCommand));
  });
});