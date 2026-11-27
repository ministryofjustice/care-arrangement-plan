import { Router } from 'express';

import pdfService from './pdfService';

const pdfRoutes = (router: Router) => {
  router.post('/api/pdfs', async (request, response) => {
    await pdfService.createPdf(request.body);

    response.sendStatus(201);
  });

  router.get(
    '/api/pdfs/plan/:planId',
    async (request, response) => {
      const { planId } = request.params;

      const pdfs = await pdfService.getPdfsByPlanId(
        planId,
      );

      response
        .status(200)
        .json(pdfs.Items ?? []);
    },
  );

  router.get(
    '/api/pdfs/:userId/:pdfId',
    async (request, response) => {
      const { userId, pdfId } = request.params;

      const pdf = await pdfService.getPdf(
        userId,
        pdfId,
      );

      response.status(200).json(pdf);
    },
  );

  router.put(
    '/api/pdfs',
    async (request, response) => {
      await pdfService.updatePdf(request.body);

      response.sendStatus(204);
    },
  );
};

export default pdfRoutes;