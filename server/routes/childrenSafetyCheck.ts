import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { yesOrNo } from '../@types/fields';
import formFields from '../constants/formFields';
import paths from '../constants/paths';
import { getBackUrl } from '../utils/sessionHelpers';

const safetyCheckRoutes = (router: Router) => {
  router.get(paths.CHILDREN_SAFETY_CHECK, (request, response) => {
    response.render('pages/childrenSafetyCheck', {
      errors: request.flash('errors'),
      title: request.__('childrenSafetyCheck.title'),
      backLinkHref: getBackUrl(request.session, paths.SAFETY_CHECK),
    });
  });

  router.get(paths.CHILDREN_NOT_SAFE, (request, response) => {
    response.render('pages/childrenNotSafe', {
      title: request.__('childrenNotSafe.title'),
    });
  });

  router.post(
    paths.CHILDREN_SAFETY_CHECK,
    body(formFields.CHILDREN_SAFETY_CHECK)
      .exists()
      .withMessage((_value, { req }) => req.__('childrenSafetyCheck.error')),
    (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.CHILDREN_SAFETY_CHECK);
      }

      const { [formFields.CHILDREN_SAFETY_CHECK]: isSafe } = matchedData<{
        [formFields.CHILDREN_SAFETY_CHECK]: yesOrNo;
      }>(request);

      return isSafe === 'Yes' ? response.redirect(paths.DO_WHATS_BEST) : response.redirect(paths.CHILDREN_NOT_SAFE);
    },
  );
};

export default safetyCheckRoutes;
