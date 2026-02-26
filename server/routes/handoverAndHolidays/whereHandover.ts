import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';

import { whereHandoverField } from '../../@types/fields';
import formFields from '../../constants/formFields';
import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig  from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl } from '../../utils/sessionHelpers';

const whereHandoverRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER, checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_WHERE_HANDOVER), (request, response) => {
    const formValues = {
      [formFields.WHERE_HANDOVER]: request.session.handoverAndHolidays?.whereHandover?.where,
      [formFields.WHERE_HANDOVER_OTHER]: request.session.handoverAndHolidays?.whereHandover?.other,
      ...request.flash('formValues')?.[0],
    };

    response.render('pages/handoverAndHolidays/whereHandover', {
      errors: request.flash('errors'),
      formValues,
      values: request.session,
      title: request.__('handoverAndHolidays.whereHandover.title'),
      backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS),
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_WHERE_HANDOVER),
    body(formFields.WHERE_HANDOVER_OTHER)
      .if(body(formFields.WHERE_HANDOVER).toArray().custom((value: string[]) => value && value.includes('other')))
      .trim()
      .notEmpty()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.whereHandover.otherMissingError')),
    body(formFields.WHERE_HANDOVER)
      .exists()
      .toArray()
      .withMessage((_value, { req }) => req.__('handoverAndHolidays.whereHandover.emptyError')),
    (request, response) => {
      const formData = matchedData<{
        [formFields.WHERE_HANDOVER_OTHER]: string;
        [formFields.WHERE_HANDOVER]: whereHandoverField[];
      }>(request, { onlyValidData: false });

      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array());
        request.flash('formValues', formData);
        return response.redirect(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER);
      }

      const { [formFields.WHERE_HANDOVER]: whereHandover, [formFields.WHERE_HANDOVER_OTHER]: other } = formData;

      request.session.handoverAndHolidays = {
        ...request.session.handoverAndHolidays,
        whereHandover: {
          noDecisionRequired: false,
          where: whereHandover,
          other: whereHandover.includes('other') ? other : undefined,
        },
      };

      addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WHERE_HANDOVER);

      return response.redirect(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);
    },
  );

  router.post(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER_NOT_REQUIRED, checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_WHERE_HANDOVER), (request, response) => {
    request.session.handoverAndHolidays = {
      ...request.session.handoverAndHolidays,
      whereHandover: {
        noDecisionRequired: true,
      },
    };

    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_WHERE_HANDOVER);

    return response.redirect(paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS);
  });
};

export default whereHandoverRoutes;
