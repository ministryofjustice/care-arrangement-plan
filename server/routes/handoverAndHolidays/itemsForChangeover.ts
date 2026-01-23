import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig  from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getSessionValue, setSessionSection } from '../../utils/perChildSession';
import { getBackUrl, getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const itemsForChangeoverRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER, checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER), (request, response) => {
    const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays');

    response.render('pages/handoverAndHolidays/itemsForChangeover', {
      errors: request.flash('errors'),
      title: request.__('handoverAndHolidays.itemsForChangeover.title'),
      initialItemsForChangeover: handoverAndHolidays?.itemsForChangeover?.answer,
      backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS),
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER,
    body(formFields.ITEMS_FOR_CHANGEOVER)
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.itemsForChangeover.error')),
    (request, response) => {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);
      }

      const { [formFields.ITEMS_FOR_CHANGEOVER]: whatWillHappen } = matchedData<{
        [formFields.ITEMS_FOR_CHANGEOVER]: string;
      }>(request, { onlyValidData: false });

      const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays') || {};
      setSessionSection(request.session, 'handoverAndHolidays', {
        ...handoverAndHolidays,
        itemsForChangeover: {
          noDecisionRequired: false,
          answer: whatWillHappen,
        },
      });

      addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER); 

      return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
    },
  );

  router.post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_NOT_REQUIRED, (request, response) => {
    const handoverAndHolidays = getSessionValue<any>(request.session, 'handoverAndHolidays') || {};
    setSessionSection(request.session, 'handoverAndHolidays', {
      ...handoverAndHolidays,
      itemsForChangeover: {
        noDecisionRequired: true,
      },
    });

    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);

    return response.redirect(getRedirectUrlAfterFormSubmit(request.session, paths.TASK_LIST));
  });
};

export default itemsForChangeoverRoutes;
