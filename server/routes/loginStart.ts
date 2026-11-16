import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import formFields from '../constants/formFields';
import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import checkFormProgressFromConfig from '../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../utils/addCompletedStep';

const startNewPlan = 'start-new-plan';
const signInToContinue = 'sign-in';

const loginStartRoutes = (router: Router) => {
  router.get(paths.LOGIN_START, checkFormProgressFromConfig(FORM_STEPS.LOGIN_START), (request, response) => {
    response.render('pages/loginStart', {
      errors: request.flash('errors'),
      title: request.__('loginStart.title'),
      backLinkHref: paths.LOGIN_START,
    });
  });

  router.post(
    paths.LOGIN_START,
    body(formFields.LOGIN_START)
      .isIn([startNewPlan, signInToContinue])
      .withMessage((_value, { req }) => req.__('loginStart.error')),
    (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.LOGIN_START);
      }

      const { [formFields.LOGIN_START]: choice } = matchedData<{
        [formFields.LOGIN_START]: typeof startNewPlan | typeof signInToContinue;
      }>(request);

      if (choice === signInToContinue) {
        request.session.returnUrl = paths.LOGIN_ACCOUNT;
        return response.redirect(paths.SIGN_IN);
      }

      request.session.continueWithoutSignIn = true;
      addCompletedStep(request, FORM_STEPS.LOGIN_START);
      return response.redirect(paths.CHILDREN_SAFETY_CHECK);
    },
  );
};

export default loginStartRoutes;
