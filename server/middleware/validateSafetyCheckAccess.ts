import { Request, Response, NextFunction } from 'express';

import config from '../config';
import FORM_STEPS from '../constants/formSteps';
import addCompletedStep from '../utils/addCompletedStep';

/**
 * Middleware to validate that users arrive at Safety Check through the proper flow.
 *
 * In production: Users must come from the GDS start page (via referrer check)
 * In development: Direct access is allowed for testing convenience
 *
 * This prevents users from bypassing the GDS start page in production while
 * maintaining developer-friendly behavior for local testing.
 */
const validateSafetyCheckAccess = (request: Request, response: Response, next: NextFunction) => {
  const completedSteps: string[] = request.session?.completedSteps || [];
  const referrer = request.get('Referer') || '';
  const hasCompletedStart = completedSteps.includes(FORM_STEPS.START);
  const isFromGDS = referrer.startsWith(config.gdsStartPageUrl);

  // Allow access if user came from GDS or already completed START
  if (isFromGDS || hasCompletedStart) {
    addCompletedStep(request, FORM_STEPS.START);
    return next();
  }

  // In development, allow direct access for testing
  if (!config.production) {
    addCompletedStep(request, FORM_STEPS.START);
    return next();
  }

  // In production, redirect unauthorized users to GDS start page
  return response.redirect(config.gdsStartPageUrl);
};

export default validateSafetyCheckAccess;
