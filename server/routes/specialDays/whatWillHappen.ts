import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig  from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const whatWillHappenRoutes = (router: Router) => {
  router.get(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN, checkFormProgressFromConfig(FORM_STEPS.SPECIAL_DAYS_WHAT_WILL_HAPPEN), (request, response) => {
    response.render('pages/specialDays/whatWillHappen', {
      errors: request.flash('errors'),
      title: request.__('specialDays.whatWillHappen.title'),
      initialWhatWillHappen: request.session.specialDays?.whatWillHappen?.answer,
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
    });
  });

  router.post(
    paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN,
    body(formFields.SPECIAL_DAYS)
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('specialDays.whatWillHappen.error')),
    (request, response) => {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN);
      }

      const { [formFields.SPECIAL_DAYS]: whatWillHappen } = matchedData<{
        [formFields.SPECIAL_DAYS]: string;
      }>(request, { onlyValidData: false });

      request.session.specialDays = {
        ...request.session.specialDays,
        whatWillHappen: {
          noDecisionRequired: false,
          answer: whatWillHappen,
        },
      };

      addCompletedStep(request, FORM_STEPS.SPECIAL_DAYS_WHAT_WILL_HAPPEN);

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
  );

  router.post(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN_NOT_REQUIRED, (request, response) => {
    request.session.specialDays = {
      ...request.session.specialDays,
      whatWillHappen: {
        noDecisionRequired: true,
      },
    };

    addCompletedStep(request, FORM_STEPS.SPECIAL_DAYS_WHAT_WILL_HAPPEN);

    return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
  });
};

export default whatWillHappenRoutes;
