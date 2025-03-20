import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import i18n from 'i18n';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import { getBackUrl } from '../../utils/sessionHelpers';

const whatOtherThingsMatterRoutes = (router: Router) => {
  router.get(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER, (request, response) => {
    response.render('pages/otherThings/whatOtherThingsMatter', {
      errors: request.flash('errors'),
      title: i18n.__('otherThings.whatOtherThingsMatter.title'),
      initialWhatOtherThingsMatter: request.session.otherThings?.whatOtherThingsMatter?.answer,
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST),
    });
  });

  router.post(
    paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER,
    body(formFields.WHAT_OTHER_THINGS_MATTER)
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('otherThings.whatOtherThingsMatter.error')),
    (request, response) => {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER);
      }

      const { [formFields.WHAT_OTHER_THINGS_MATTER]: whatOtherThingsMatter } = matchedData<{
        [formFields.WHAT_OTHER_THINGS_MATTER]: string;
      }>(request, { onlyValidData: false });

      request.session.otherThings = {
        ...request.session.otherThings,
        whatOtherThingsMatter: {
          noDecisionRequired: false,
          answer: whatOtherThingsMatter,
        },
      };

      return response.redirect(paths.TASK_LIST);
    },
  );

  router.post(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER_NOT_REQUIRED, (request, response) => {
    request.session.otherThings = {
      ...request.session.otherThings,
      whatOtherThingsMatter: {
        noDecisionRequired: true,
      },
    };

    return response.redirect(paths.TASK_LIST);
  });
};

export default whatOtherThingsMatterRoutes;
