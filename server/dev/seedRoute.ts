import { Router } from 'express';

import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';

import devSeedData from './seedData';

const devSeedRoutes = (router: Router) => {
  router.get('/dev/seed', (request, response) => {
    Object.assign(request.session, devSeedData, { planStartTime: Date.now() });

    request.session.completedSteps = Object.values(FORM_STEPS);
    request.session.pageHistory = [paths.START];

    const redirect = request.query.redirect as string;
    const allowedPaths = new Set<string>(Object.values(paths));
    const target = allowedPaths.has(redirect) ? redirect : paths.TASK_LIST;

    response.redirect(target);
  });
};

export default devSeedRoutes;
