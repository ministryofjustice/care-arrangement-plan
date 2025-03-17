import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import i18n from 'i18n';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';

const whatWillHappenRoutes = (router: Router) => {
  router.get(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN, (request, response) => {
    response.render('pages/specialDays/whatWillHappen', {
      errors: request.flash('errors'),
      title: i18n.__('specialDays.whatWillHappen.title'),
      initialWhatWillHappen: request.session.specialDays?.whatWillHappen?.answer,
      backLinkHref: paths.TASK_LIST,
    });
  });

  router.post(
    paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN,
    // TODO C5141-1013: Add error messages
    body(formFields.SPECIAL_DAYS).trim().notEmpty(),
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

      return response.redirect(paths.TASK_LIST);
    },
  );

  router.post(paths.SPECIAL_DAYS_WHAT_WILL_HAPPEN_NOT_REQUIRED, (request, response) => {
    request.session.specialDays = {
      ...request.session.specialDays,
      whatWillHappen: {
        noDecisionRequired: true,
      },
    };

    return response.redirect(paths.TASK_LIST);
  });
};

export default whatWillHappenRoutes;
