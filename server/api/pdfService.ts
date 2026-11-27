import PdfRepository, { Pdf } from './pdfRepository';

const pdfRepository = new PdfRepository();

const getPdf = async (
  userId: string,
  pdfId: string,
) => {
  return pdfRepository.getPdf(userId, pdfId);
};

const getPdfsByPlanId = async (
  planId: string,
) => {
  return pdfRepository.getPdfsByPlanId(
    planId,
  );
};

const createPdf = async (pdf: Pdf) => {
  return pdfRepository.createPdf(pdf);
};

const updatePdf = async (pdf: Pdf) => {
  return pdfRepository.updatePdf(pdf);
};

export default {
  getPdf,
  getPdfsByPlanId,
  createPdf,
  updatePdf,
};