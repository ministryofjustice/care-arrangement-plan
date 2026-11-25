import ArrangementRepository, { Arrangement } from '../api/arrangementRepository';

import ArrangementService from './arrangementService';
jest.mock('../api/arrangementRepository');
describe('ArrangementService', () => {
let service: ArrangementService;
let repository: jest.Mocked<ArrangementRepository>;
beforeEach(() => {
service = new ArrangementService();
repository = (ArrangementRepository as jest.MockedClass<typeof ArrangementRepository>)
.mock.instances[0] as jest.Mocked<ArrangementRepository>;
});
it('calls createArrangement on the repository', async () => {
const arrangement = {} as Arrangement;
await service.createArrangement(arrangement);
expect(repository.createArrangement).toHaveBeenCalledWith(arrangement);
});
it('calls getArrangement on the repository', async () => {
await service.getArrangement('user-1', 'arrangement-1');
expect(repository.getArrangement).toHaveBeenCalledWith(
'user-1',
'arrangement-1',
);
});
});