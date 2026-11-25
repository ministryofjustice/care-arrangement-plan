 import ArrangementRepository, { Arrangement } from '../api/arrangementRepository';

export default class ArrangementService {
  private readonly arrangementRepository: ArrangementRepository;

  constructor() {
    this.arrangementRepository = new ArrangementRepository();
  }

  async createArrangement(arrangement: Arrangement) {
    return this.arrangementRepository.createArrangement(arrangement);
  }

  async getArrangement(userId: string, arrangementId: string) {
    return this.arrangementRepository.getArrangement(userId, arrangementId);
  }
}