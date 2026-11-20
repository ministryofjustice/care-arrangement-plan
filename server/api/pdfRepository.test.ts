import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import dynamoClient from './dynamoClient';
import PdfRepository from './pdfRepository';

jest.mock('./dynamoClient', () => ({
  send: jest.fn(),
}));

const mockedSend = dynamoClient.send as jest.MockedFunction<
  typeof dynamoClient.send
>;

describe('PdfRepository', () => {
  const repository = new PdfRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets a pdf', async () => {
    mockedSend.mockResolvedValue({} as never);

    await repository.getPdf('123', '456');

    expect(mockedSend).toHaveBeenCalledWith(
      expect.any(GetCommand),
    );
  });

  it('creates a pdf', async () => {
    mockedSend.mockResolvedValue({} as never);

    await repository.createPdf({
      userId: '123',
      pdfId: '456',
    });

    expect(mockedSend).toHaveBeenCalledWith(
      expect.any(PutCommand),
    );
  });
});