import { Router } from 'express';

import arrangementService from './arrangementService';

const arrangementRoutes = (router: Router) => {
    router.post('/api/arrangements', async (request, response) => {
        await arrangementService.createArrangement(
            request.body,
        );

        response.sendStatus(201);
    });

    router.get(
        '/api/arrangements/:userId/:arrangementId',
        async (request, response) => {
            const { userId, arrangementId } = request.params;

            const arrangement =
                await arrangementService.getArrangement(
                    userId,
                    arrangementId,
                );

            response.status(200).json(arrangement);
        },
    );

    router.put(
        '/api/arrangements',
        async (request, response) => {
            await arrangementService.updateArrangement(
                request.body,
            );

            response.sendStatus(204);
        },
    );
};

export default arrangementRoutes;