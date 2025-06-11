import { Router } from 'express';

const setupRobotsTxt = (): Router => {
  const router = Router();

  router.use('/robots.txt', (request, response) => {
    response.type('text/plain');
    // Disallow all web crawlers from indexing the site
    response.send('User-Agent: *\nDisallow: /\n');
  });
  return router;
};

export default setupRobotsTxt;
