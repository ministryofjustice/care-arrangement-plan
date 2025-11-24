import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import { checkFormProgressFromConfig } from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl } from '../../utils/sessionHelpers';

const howChangeDuringSchoolHolidaysRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS, checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS), (request, response) => {
    response.render('pages/handoverAndHolidays/howChangeDuringSchoolHolidays', {
      errors: request.flash('errors'),
      title: request.__('handoverAndHolidays.howChangeDuringSchoolHolidays.title'),
      initialHowChangeDuringSchoolHolidays: request.session.handoverAndHolidays?.howChangeDuringSchoolHolidays?.answer,
      backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS),
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

      addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS);

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

    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS);

    return response.redirect(paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER);
  });
};

export default howChangeDuringSchoolHolidaysRoutes;
