import planService from './planService';

describe('planService', () => {
  describe('getPlan', () => {
    it('should be defined', () => {
      expect(planService.getPlan).toBeDefined();
    });
  });

  describe('getPlansByArrangement', () => {
    it('should be defined', () => {
      expect(planService.getPlansByArrangement).toBeDefined();
    });
  });

  describe('createPlan', () => {
    it('should be defined', () => {
      expect(planService.createPlan).toBeDefined();
    });
  });

  describe('updatePlan', () => {
    it('should be defined', () => {
      expect(planService.updatePlan).toBeDefined();
    });
  });
});