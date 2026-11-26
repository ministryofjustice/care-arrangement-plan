import express from 'express';
import request from 'supertest';

import pdfRoutes from './pdfRoutes';
import pdfService from './pdfService';

jest.mock('./pdfService', () => ({
  __esModule: true,
  default: {
    createPdf: jest.fn(),
    getPdf: jest.fn(),
  },
}));

describe('pdfRoutes', () => {
  const app = express();

  beforeEach(() => {
    app.use(express.json());

    const router = express.Router();
    pdfRoutes(router);
    app.use(router);

    jest.clearAllMocks();
  });

  test('POST /api/pdfs returns 201', async () => {
    const body = {
      userId: 'user-1',
      pdfId: 'pdf-1',
    };

    const response = await request(app)
      .post('/api/pdfs')
      .send(body);

    expect(response.status).toBe(201);
    expect(pdfService.createPdf).toHaveBeenCalledWith(body);
  });

  test('GET /api/pdfs/:userId/:pdfId returns pdf', async () => {
    const pdf = {
      userId: 'user-1',
      pdfId: 'pdf-1',
    };

    (pdfService.getPdf as jest.Mock).mockResolvedValue(pdf);

    const response = await request(app).get(
      '/api/pdfs/user-1/pdf-1',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(pdf);

    expect(pdfService.getPdf).toHaveBeenCalledWith(
      'user-1',
      'pdf-1',
    );
  });
});