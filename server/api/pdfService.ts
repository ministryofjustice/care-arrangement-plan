import PdfRepository, { Pdf } from './pdfRepository';

const pdfRepository = new PdfRepository();

const getPdf = async (
  userId: string,
  pdfId: string,
) => {
  return pdfRepository.getPdf(userId, pdfId);
};

const createPdf = async (pdf: Pdf) => {
  return pdfRepository.createPdf(pdf);
};

export default {
  getPdf,
  createPdf,
};
