import PdfRepository, { Pdf } from '../api/pdfRepository';

export default class PdfService {
  private readonly pdfRepository: PdfRepository;

  constructor() {
    this.pdfRepository = new PdfRepository();
  }

  async createPdf(pdf: Pdf) {
    return this.pdfRepository.createPdf(pdf);
  }

  async getPdf(userId: string, pdfId: string) {
    return this.pdfRepository.getPdf(userId, pdfId);
  }
}