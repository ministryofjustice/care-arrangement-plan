import PlanRepository, { Plan } from '../api/planRepository';

export default class PlanService {
  private readonly planRepository: PlanRepository;

  constructor() {
    this.planRepository = new PlanRepository();
  }

  async createPlan(plan: Plan) {
    return this.planRepository.createPlan(plan);
  }

  async getPlan(arrangementId: string, planId: string) {
    return this.planRepository.getPlan(arrangementId, planId);
  }
}