import { Router } from 'express';

import paths from '../constants/paths';
import createPdf from '../pdf/createPdf';
import createHtmlContent from '../html/createHtmlContent';
import getAssetPath from '../utils/getAssetPath';
import { formattedChildrenNames } from '../utils/sessionHelpers';

const pdfRoutes = (router: Router) => {
  router.get(paths.DOWNLOAD_PDF, (request, response) => {
    const pdf = createPdf(false, request);

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename=${request.__('pdf.name')}.pdf`);
    response.send(Buffer.from(pdf));
  });

  router.get(paths.PRINT_PDF, (request, response) => {
    const pdf = createPdf(true, request);

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `inline; filename=${request.__('pdf.name')}.pdf`);
    response.send(Buffer.from(pdf));
  });

  router.get(paths.DOWNLOAD_PAPER_FORM, (request, response) => {
    response.download(getAssetPath('other/paperForm.pdf'), `${request.__('pdf.name')}.pdf`);
  });

  router.get(paths.DOWNLOAD_HTML, (request, response) => {
    const htmlContent = createHtmlContent(request);
    const childrenNames = formattedChildrenNames(request);

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename=${request.__('pdf.name')}.html`);

    response.render('pages/downloadablePlan', {
      values: {
        initialAdultName: request.session.initialAdultName,
        secondaryAdultName: request.session.secondaryAdultName,
        numberOfChildren: request.session.numberOfChildren,
        childrenNames,
      },
      htmlContent,
    });
  });
};

export default pdfRoutes;
