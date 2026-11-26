import pdfService from './pdfService';

describe('pdfService', () => {
  describe('getPdf', () => {
    it('should be defined', () => {
      expect(pdfService.getPdf).toBeDefined();
    });
  });

  describe('createPdf', () => {
    it('should be defined', () => {
      expect(pdfService.createPdf).toBeDefined();
    });
  });

  describe('updatePdf', () => {
        it('should be defined', () => {
            expect(pdfService.updatePdf).toBeDefined();
        });
    });
});