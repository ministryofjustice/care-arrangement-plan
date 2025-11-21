import { Request } from 'express';

/**
 * Adds a step key to the session's completedSteps array only if it doesn't already exist.
 * @param req The Express Request object.
 * @param stepKey The key of the step that was just completed (e.g., 'step2').
 */
export function addCompletedStep(req: Request, stepKey: string): void {
    if (!req.session.completedSteps) {
        req.session.completedSteps = [];
    }
    
    if (!req.session.completedSteps.includes(stepKey)) {
        req.session.completedSteps.push(stepKey);
    }
}