import arrangementService from './arrangementService';

describe('arrangementService', () => {
  describe('getArrangement', () => {
    it('should be defined', () => {
      expect(arrangementService.getArrangement).toBeDefined();
    });
  });

  describe('createArrangement', () => {
    it('should be defined', () => {
      expect(arrangementService.createArrangement).toBeDefined();
    });
  });
});