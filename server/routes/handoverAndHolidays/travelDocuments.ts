import { Router } from 'express';

import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl } from '../../utils/sessionHelpers';

const travelDocumentsRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS),
    (request, response) => {
    response.render('pages/handoverAndHolidays/travelDocuments', {
      errors: request.flash('errors'),
      title: request.__('handoverAndHolidays.travelDocuments.title'),
      backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT)
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS),
    (request, response) => {
    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS);
    response.redirect(paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT);
  });
};

export default travelDocumentsRoutes;
