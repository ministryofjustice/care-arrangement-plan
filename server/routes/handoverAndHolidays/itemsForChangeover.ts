import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import i18n from 'i18n';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';

const itemsForChangeoverRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER, (request, response) => {
    response.render('pages/handoverAndHolidays/itemsForChangeover', {
      errors: request.flash('errors'),
      title: i18n.__('handoverAndHolidays.itemsForChangeover.title'),
      initialItemsForChangeover: request.session.handoverAndHolidays?.itemsForChangeover?.answer,
      backLinkHref: paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS,
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER,
    // TODO C5141-1013: Add error messages
    body(formFields.ITEMS_FOR_CHANGEOVER).trim().notEmpty(),
    (request, response) => {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);
      }

      const { [formFields.ITEMS_FOR_CHANGEOVER]: whatWillHappen } = matchedData<{
        [formFields.ITEMS_FOR_CHANGEOVER]: string;
      }>(request, { onlyValidData: false });

      request.session.handoverAndHolidays = {
        ...request.session.handoverAndHolidays,
        itemsForChangeover: {
          noDecisionRequired: false,
          answer: whatWillHappen,
        },
      };

      return response.redirect(paths.TASK_LIST);
    },
  );

  router.post(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER_NOT_REQUIRED, (request, response) => {
    request.session.handoverAndHolidays = {
      ...request.session.handoverAndHolidays,
      itemsForChangeover: {
        noDecisionRequired: true,
      },
    };

    return response.redirect(paths.TASK_LIST);
  });
};

export default itemsForChangeoverRoutes;
