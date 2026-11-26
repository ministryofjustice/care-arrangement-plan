import express from 'express';
import request from 'supertest';

import planRoutes from './planRoutes';
import planService from './planService';

jest.mock('./planService', () => ({
  __esModule: true,
  default: {
    createPlan: jest.fn(),
    getPlan: jest.fn(),
  },
}));

describe('planRoutes', () => {
  const app = express();

  beforeEach(() => {
    app.use(express.json());

    const router = express.Router();
    planRoutes(router);
    app.use(router);

    jest.clearAllMocks();
  });

  test('POST /api/plans returns 201', async () => {
    const body = {
      arrangementId: 'arrangement-1',
      planId: 'plan-1',
    };

    const response = await request(app)
      .post('/api/plans')
      .send(body);

    expect(response.status).toBe(201);
    expect(planService.createPlan).toHaveBeenCalledWith(body);
  });

  test('GET /api/plans/:arrangementId/:planId returns plan', async () => {
    const plan = {
      arrangementId: 'arrangement-1',
      planId: 'plan-1',
    };

    (planService.getPlan as jest.Mock).mockResolvedValue(plan);

    const response = await request(app).get(
      '/api/plans/arrangement-1/plan-1',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(plan);

    expect(planService.getPlan).toHaveBeenCalledWith(
      'arrangement-1',
      'plan-1',
    );
  });
});