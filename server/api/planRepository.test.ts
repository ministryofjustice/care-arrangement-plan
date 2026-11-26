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

    await repository.getPlan('arrangement-123', 'plan-456');

    expect(mockedSend).toHaveBeenCalled();
  });

  it('creates a plan', async () => {
    mockedSend.mockResolvedValue({} as never);

    await repository.createPlan({
      arrangementId: 'arrangement-123',
      planId: 'plan-456',
      status: 'draft',
      createdDate: '2026-11-23',
      updatedDate: '2026-11-23',
      ttl: 123456789,
      numberOfChildren: 2,
      namesOfChildren: ['Child One', 'Child Two'],
      initialAdultName: 'Adult One',
      secondaryAdultName: 'Adult Two',
      livingAndVisiting: {},
      handoverAndHolidays: {},
      education: {},
      childHealth: {},
      specialDays: {},
      otherThings: {},
      decisionMaking: {},
    });

    expect(mockedSend).toHaveBeenCalled();
  });

  it('updates a plan', async () => {
        mockedSend.mockResolvedValueOnce({} as never);

        await repository.updatePlan({
            arrangementId: 'arrangement-123',
            planId: 'plan-456',
            status: 'draft',
            createdDate: '2026-11-23',
            updatedDate: '2026-11-23',
            ttl: 123456789,
            numberOfChildren: 2,
            namesOfChildren: ['Child One', 'Child Two'],
            initialAdultName: 'Adult One',
            secondaryAdultName: 'Adult Two',
            livingAndVisiting: {},
            handoverAndHolidays: {},
            education: {},
            childHealth: {},
            specialDays: {},
            otherThings: {},
            decisionMaking: {},
        });

        expect(mockedSend).toHaveBeenCalled();
    });
});