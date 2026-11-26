import planService from './planService';

describe('planService', () => {
  describe('getPlan', () => {
    it('should be defined', () => {
      expect(planService.getPlan).toBeDefined();
    });
  });

  describe('createPlan', () => {
    it('should be defined', () => {
      expect(planService.createPlan).toBeDefined();
    });
  });
});