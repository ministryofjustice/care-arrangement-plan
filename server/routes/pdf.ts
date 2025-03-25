import { Router } from 'express';
import i18n from 'i18n';

import paths from '../constants/paths';
import createPdf from '../pdf/createPdf';
import getAssetPath from '../utils/getAssetPath';

const pdfRoutes = (router: Router) => {
  router.get(paths.DOWNLOAD_PDF, (request, response) => {
    const pdf = createPdf(false, request);

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename=${i18n.__('pdf.name')}.pdf`);
    response.send(Buffer.from(pdf));
  });

  router.get(paths.PRINT_PDF, (request, response) => {
    const pdf = createPdf(true, request);

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `inline; filename=${i18n.__('pdf.name')}.pdf`);
    response.send(Buffer.from(pdf));
  });

  router.get(paths.DOWNLOAD_PAPER_FORM, (_request, response) => {
    response.download(getAssetPath('other/paperForm.pdf'), `${i18n.__('pdf.name')}.pdf`);
  });
};

export default pdfRoutes;
