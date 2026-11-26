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
      planId: 'plan-123',
      pdfId: 'pdf-456',
      s3Key: 'plans/plan-123/v1.pdf',
      version: 1,
      generatedDate: '2026-11-23T10:00:00Z',
    });

    expect(mockedSend).toHaveBeenCalledWith(
      expect.any(PutCommand),
    );
  });

  it('updates a pdf', async () => {
        mockedSend.mockResolvedValueOnce({} as never);

        await repository.updatePdf({
            planId: 'plan-123',
            pdfId: 'pdf-456',
            s3Key: 'plans/plan-123/v1.pdf',
            version: 1,
            generatedDate: '2026-11-23T10:00:00Z',
        });

        expect(mockedSend).toHaveBeenCalledWith(expect.any(PutCommand));
    });
});