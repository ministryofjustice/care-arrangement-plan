import PlanRepository, { Plan } from '../api/planRepository';

import PlanService from './planService';
jest.mock('../api/planRepository');
describe('PlanService', () => {
let service: PlanService;
let repository: jest.Mocked<PlanRepository>;
beforeEach(() => {
service = new PlanService();
repository = (PlanRepository as jest.MockedClass<typeof PlanRepository>).mock.instances[0] as jest.Mocked<PlanRepository>;
});
it('calls createPlan on the repository', async () => {
const plan = {} as Plan;
await service.createPlan(plan);
expect(repository.createPlan).toHaveBeenCalledWith(plan);
});
it('calls getPlan on the repository', async () => {
await service.getPlan('arrangement-1', 'plan-1');
expect(repository.getPlan).toHaveBeenCalledWith('arrangement-1', 'plan-1');
});
});