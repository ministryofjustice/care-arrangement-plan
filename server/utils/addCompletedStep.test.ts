import { Request } from 'express';

import addCompletedStep from './addCompletedStep';

describe('addCompletedStep', () => {
    test('initialises completedSteps when missing and adds the step', () => {
        const req = { session: {} } as unknown as Request;

        addCompletedStep(req, 'step1');

        expect((req as Request).session.completedSteps).toEqual(['step1']);
    });

    test('does not add a duplicate step if already present', () => {
        const req = { session: { completedSteps: ['step1'] } } as unknown as Request;

        addCompletedStep(req, 'step1');

        expect((req as Request).session.completedSteps).toEqual(['step1']);
    });

    test('adds a new step to existing completedSteps', () => {
        const req = { session: { completedSteps: ['step1'] } } as unknown as Request;

        addCompletedStep(req, 'step2');

        expect((req as Request).session.completedSteps).toEqual(['step1', 'step2']);
    });

    test('calling twice with the same new step only adds it once', () => {
        const req = { session: {} } as unknown as Request;

        addCompletedStep(req, 'stepA');
        addCompletedStep(req, 'stepA');

        expect((req as Request).session.completedSteps).toEqual(['stepA']);
    });
});
