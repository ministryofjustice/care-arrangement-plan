import fs from 'fs';

import { Router } from 'express';

import paths from '../constants/paths';
import createHtmlContent from '../html/createHtmlContent';
import createPdf from '../pdf/createPdf';
import getAssetPath from '../utils/getAssetPath';
import { formattedChildrenNames } from '../utils/sessionHelpers';

/**
 * Routes for downloading and exporting the care arrangement plan
 * Handles multiple export formats: PDF, HTML, and paper forms
 */
const downloadRoutes = (router: Router) => {
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
    const crestImageData = `data:image/png;base64,${fs.readFileSync(getAssetPath('images/crest.png'), { encoding: 'base64' })}`;

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
      crestImageData,
    });
  });
};

export default downloadRoutes;
