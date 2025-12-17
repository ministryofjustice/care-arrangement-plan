import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

import { CAPSession } from '../@types/session';
import TASK_FLOW_MAP from '../config/flowConfig';
import logger from '../logging/logger';
import {
  hasCompletedRequiredSteps,
  hasUserStartedJourney,
  getRedirectPath,
  getFlashMessage,
} from '../utils/formProgressHelpers';

type SessionRequest = Request & { session?: Partial<CAPSession> };

/**
 * Middleware factory to check if the user has completed the prerequisites
 * defined in the `TASK_FLOW_MAP` for the given step key.
 *
 * Handles three scenarios:
 * 1. Fresh visitor (no journey started) → silent redirect to start
 * 2. POST failure (visited page but submission failed) → redirect with "progress not saved" message
 * 3. Jumping ahead (skipped required steps) → redirect with "complete this page" message
 *
 * @param currentStepKey - A key from TASK_FLOW_MAP (e.g. 'step3')
 */
function checkFormProgressFromConfig(currentStepKey: keyof typeof TASK_FLOW_MAP) {
  const startPage = TASK_FLOW_MAP.step1?.path ?? '/';
  const stepConfig = TASK_FLOW_MAP[currentStepKey];

  if (!stepConfig) {
    logger.error(`ERROR: Step '${String(currentStepKey)}' not found in TASK_FLOW_MAP.`);
    throw createError(404);
  }

  const requiredSteps = stepConfig.dependsOn || [];

  return (req: SessionRequest, res: Response, next: NextFunction) => {
    const completedSteps: string[] = req.session?.completedSteps || [];
    const pageHistory: string[] = req.session?.pageHistory || [];

    const hasRequired = hasCompletedRequiredSteps(completedSteps, requiredSteps);

    if (hasRequired) {
      return next();
    }

    // User hasn't met prerequisites - determine redirect strategy

    // Check if user has even started the journey
    if (!hasUserStartedJourney(completedSteps, pageHistory)) {
      logger.info(
        `Access denied to ${req.path} (${String(currentStepKey)}). User hasn't started journey. Redirecting to ${startPage}`
      );
      return res.redirect(startPage);
    }

    // User has started journey but is missing prerequisites
    const missingSteps = requiredSteps.filter(step => !completedSteps.includes(step));
    const redirectPath = getRedirectPath(missingSteps, startPage);
    const hasVisitedRedirectPage = pageHistory.includes(redirectPath);

    logger.info(
      `Access denied to ${req.path} (${String(currentStepKey)}). ` +
      `Missing steps: ${missingSteps.join(', ') || 'none (alternative path required)'}. ` +
      `Redirecting to ${redirectPath}. Has visited before: ${hasVisitedRedirectPage}`
    );

    const flashMessage = getFlashMessage(hasVisitedRedirectPage);
    req.flash('info', flashMessage);

    return res.redirect(redirectPath);
  };
}

export default checkFormProgressFromConfig;