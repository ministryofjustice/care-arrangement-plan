import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import i18n from 'i18n';

import { yesOrNo } from '../@types/fields';
import formFields from '../constants/formFields';
import paths from '../constants/paths';

const courtOrderCheckRoutes = (router: Router) => {
  router.get(paths.COURT_ORDER_CHECK, (request, response) => {
    response.render('pages/courtOrderCheck', {
      errors: request.flash('errors'),
      title: i18n.__('courtOrderCheck.title'),
      backLinkHref: paths.DO_WHATS_BEST,
    });
  });

  // TODO C5141-1013: Add error message
  router.post(paths.COURT_ORDER_CHECK, body(formFields.COURT_ORDER_CHECK).exists(), (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      request.flash('errors', errors.array());
      return response.redirect(paths.COURT_ORDER_CHECK);
    }

    const { [formFields.COURT_ORDER_CHECK]: existingCourtOrder } = matchedData<{
      [formFields.COURT_ORDER_CHECK]: yesOrNo;
    }>(request);

    if (existingCourtOrder === 'Yes') {
      request.session.courtOrderInPlace = true;
      return response.redirect(paths.EXISTING_COURT_ORDER);
    }
    request.session.courtOrderInPlace = false;
    return response.redirect(paths.NUMBER_OF_CHILDREN);
  });
};

export default courtOrderCheckRoutes;
