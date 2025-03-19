import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import i18n from 'i18n';

import formFields from '../../constants/formFields';
import paths from '../../constants/paths';

const howChangeDuringSchoolHolidaysRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS, (request, response) => {
    response.render('pages/handoverAndHolidays/howChangeDuringSchoolHolidays', {
      errors: request.flash('errors'),
      title: i18n.__('handoverAndHolidays.howChangeDuringSchoolHolidays.title'),
      initialHowChangeDuringSchoolHolidays: request.session.handoverAndHolidays?.howChangeDuringSchoolHolidays?.answer,
      backLinkHref: paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS,
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS,
    body(formFields.HOW_CHANGE_DURING_SCHOOL_HOLIDAYS)
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.howChangeDuringSchoolHolidays.error')),
    (request, response) => {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        return response.redirect(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS);
      }

      const { [formFields.HOW_CHANGE_DURING_SCHOOL_HOLIDAYS]: whatWillHappen } = matchedData<{
        [formFields.HOW_CHANGE_DURING_SCHOOL_HOLIDAYS]: string;
      }>(request, { onlyValidData: false });

      request.session.handoverAndHolidays = {
        ...request.session.handoverAndHolidays,
        howChangeDuringSchoolHolidays: {
          noDecisionRequired: false,
          answer: whatWillHappen,
        },
      };

      return response.redirect(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);
    },
  );

  router.post(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS_NOT_REQUIRED, (request, response) => {
    request.session.handoverAndHolidays = {
      ...request.session.handoverAndHolidays,
      howChangeDuringSchoolHolidays: {
        noDecisionRequired: true,
      },
    };

    return response.redirect(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);
  });
};

export default howChangeDuringSchoolHolidaysRoutes;
