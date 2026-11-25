import PlanRepository, { Plan } from './planRepository';

const planRepository = new PlanRepository();

const getPlan = async (
  arrangementId: string,
  planId: string,
) => {
  return planRepository.getPlan(arrangementId, planId);
};

const createPlan = async (plan: Plan) => {
  return planRepository.createPlan(plan);
};

export default {
  getPlan,
  createPlan,
};