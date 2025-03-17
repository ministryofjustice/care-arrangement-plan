import { Router } from 'express';

import config from '../config';

const { buildNumber, gitRef, gitBranch } = config;

const setUpHealthCheck = (): Router => {
  const router = Router();

  router.get('/health', (_, response, _next) => {
    response.json({
      gitHash: gitRef,
      branch: gitBranch,
      version: buildNumber,
      uptime: Math.floor(process.uptime()),
    });
  });
  return router;
};

export default setUpHealthCheck;
