import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';
import { getBackUrl } from '../../utils/sessionHelpers';

const itemsForChangeoverRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER, (request, response) => {
    response.render('pages/handoverAndHolidays/itemsForChangeover', {
      errors: request.flash('errors'),
      title: request.__('handoverAndHolidays.itemsForChangeover.title'),
      initialItemsForChangeover: request.session.handoverAndHolidays?.itemsForChangeover?.answer,
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
