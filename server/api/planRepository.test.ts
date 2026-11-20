import dynamoClient from './dynamoClient';
import PlanRepository from './planRepository';

jest.mock('./dynamoClient', () => ({
  send: jest.fn(),
}));

const mockedSend = dynamoClient.send as jest.MockedFunction<
  typeof dynamoClient.send
>;

describe('PlanRepository', () => {
  const repository = new PlanRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets a plan', async () => {
    mockedSend.mockResolvedValue({} as never);

    await repository.getPlan('123', '456');

    expect(mockedSend).toHaveBeenCalled();
  });

  it('creates a plan', async () => {
    mockedSend.mockResolvedValue({} as never);

    await repository.createPlan({
      userId: '123',
      pdfId: '456',
    });

    expect(mockedSend).toHaveBeenCalled();
  });
});