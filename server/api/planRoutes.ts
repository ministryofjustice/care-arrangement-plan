import { Router } from 'express';

import planService from './planService';

const planRoutes = (router: Router) => {
    router.post('/api/plans', async (request, response) => {
        await planService.createPlan(request.body);

        response.sendStatus(201);
    });

    router.get('/api/plans/:arrangementId/:planId', async (request, response) => {
        const { arrangementId, planId } = request.params;

        const plan = await planService.getPlan(
            arrangementId,
            planId,
        );

        response.status(200).json(plan);
    });

    router.put(
        '/api/plans',
        async (request, response) => {
            await planService.updatePlan(request.body);

            response.sendStatus(204);
        },
    );
};

export default planRoutes;