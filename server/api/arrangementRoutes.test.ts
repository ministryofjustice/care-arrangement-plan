import express from 'express';
import request from 'supertest';

import arrangementRoutes from './arrangementRoutes';
import arrangementService from './arrangementService';

jest.mock('./arrangementService', () => ({
  __esModule: true,
  default: {
    createArrangement: jest.fn(),
    getArrangement: jest.fn(),
  },
}));

describe('arrangementRoutes', () => {
  const app = express();

  beforeEach(() => {
    app.use(express.json());

    const router = express.Router();
    arrangementRoutes(router);
    app.use(router);

    jest.clearAllMocks();
  });

  test('POST /api/arrangements returns 201', async () => {
    const body = {
      userId: 'user-1',
      arrangementId: 'arrangement-1',
    };

    const response = await request(app)
      .post('/api/arrangements')
      .send(body);

    expect(response.status).toBe(201);
    expect(arrangementService.createArrangement).toHaveBeenCalledWith(body);
  });

  test('GET /api/arrangements/:userId/:arrangementId returns arrangement', async () => {
    const arrangement = {
      userId: 'user-1',
      arrangementId: 'arrangement-1',
    };

    (arrangementService.getArrangement as jest.Mock).mockResolvedValue(
      arrangement,
    );

    const response = await request(app).get(
      '/api/arrangements/user-1/arrangement-1',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(arrangement);

    expect(arrangementService.getArrangement).toHaveBeenCalledWith(
      'user-1',
      'arrangement-1',
    );
  });
});