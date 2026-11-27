import arrangementService from './arrangementService';

describe('arrangementService', () => {
  describe('getArrangement', () => {
    it('should be defined', () => {
      expect(arrangementService.getArrangement).toBeDefined();
    });
  });

  describe('getArrangementsByUserId', () => {
    it('should be defined', () => {
      expect(arrangementService.getArrangementsByUserId).toBeDefined();
    });
  });

  describe('createArrangement', () => {
    it('should be defined', () => {
      expect(arrangementService.createArrangement).toBeDefined();
    });
  });

  describe('updateArrangement', () => {
    it('should be defined', () => {
      expect(arrangementService.updateArrangement).toBeDefined();
    });
  });
});