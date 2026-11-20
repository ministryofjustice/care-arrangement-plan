import dynamoClient from './dynamoClient';

export interface Plan {
  userId: string;
  pdfId: string;
}

export default class PlanRepository {
  private readonly client = dynamoClient;

  async getPlan(userId: string, pdfId: string) {
    return { userId, pdfId };
  }

  async createPlan(plan: Plan) {
    return plan;
  }
}