import express, { Express } from 'express';

import setUpi18n from '../middleware/setUpi18n';
import Pdf from '../pdf/pdf';
import { sessionMock } from '../test-utils/testMocks';

export const TEST_PATH = '/test';

const testAppSetup = (addToPdf: (pdf: Pdf, req: express.Request) => void): Express => {
  const app = express();

  app.use(setUpi18n());
  app.use((req, _response, next) => {
    req.session = sessionMock;
    next();
  });
  app.get(TEST_PATH, (req, response) => {
    const pdf = new Pdf(false);
    addToPdf(pdf, req);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename=test.pdf`);
    response.send(Buffer.from(pdf.toArrayBuffer()));
  });

  return app;
};

export default testAppSetup;
