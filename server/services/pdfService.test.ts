import PdfRepository, { Pdf } from '../api/pdfRepository';

import PdfService from './pdfService';

jest.mock('../api/pdfRepository');

describe('PdfService', () => {
  let service: PdfService;
  let repository: jest.Mocked<PdfRepository>;

  beforeEach(() => {
    service = new PdfService();
    repository = (PdfRepository as jest.MockedClass<typeof PdfRepository>)
      .mock.instances[0] as jest.Mocked<PdfRepository>;
  });

  it('calls createPdf on the repository', async () => {
    const pdf = {} as Pdf;

    await service.createPdf(pdf);

    expect(repository.createPdf).toHaveBeenCalledWith(pdf);
  });

  it('calls getPdf on the repository', async () => {
    await service.getPdf('user-1', 'pdf-1');

    expect(repository.getPdf).toHaveBeenCalledWith('user-1', 'pdf-1');
  });
});