import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

import { CAPSession } from '../@types/session';
import TASK_FLOW_MAP from "../config/flowConfig";
import logger from '../logging/logger';


/**
 * Middleware factory to check if the user has completed the prerequisites
 * defined in the `TASK_FLOW_MAP` for the given step key.
 * @param currentStepKey - A key from TASK_FLOW_MAP (e.g. 'step3')
 */
export function checkFormProgressFromConfig(currentStepKey: keyof typeof TASK_FLOW_MAP) {
  const startPage = TASK_FLOW_MAP.step1?.path ?? '/';

  if (!TASK_FLOW_MAP[currentStepKey]) {
    logger.error(`ERROR: Step '${String(currentStepKey)}' not found in TASK_FLOW_MAP.`);
    createError(404)
  }

  const requiredSteps = TASK_FLOW_MAP[currentStepKey]?.dependsOn || [];

  return (req: Request & { session?: Partial<CAPSession> }, res: Response, next: NextFunction) => {
    const completed: string[] = (req.session && req.session.completedSteps) || [];

    const hasProgress = requiredSteps.every(step => completed.includes(step));

    if (hasProgress) {
      return next();
    }

    const missing = requiredSteps.filter(s => !completed.includes(s));

    logger.info(`Access denied to ${req.path} (${String(currentStepKey)}). Missing steps: ${missing.join(', ')}. Redirecting to ${startPage}`);
    return res.redirect(startPage);
  };
}