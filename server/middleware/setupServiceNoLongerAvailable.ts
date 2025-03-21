import { Router } from 'express';

import config from '../config';

const setupServiceNoLongerAvailable = (): Router => {
  const router = Router();

  router.use('*', (request, response, next) => {
    if (new Date() < config.previewEnd) {
      return next();
    }
    response.render('pages/serviceNoLongerAvailable', {
      title: 'The private view of this service is now finished',
    });
  });
  return router;
};

export default setupServiceNoLongerAvailable;
